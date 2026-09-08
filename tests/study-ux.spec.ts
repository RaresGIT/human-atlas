import {studyViewport} from '../app/study-model';
import {test, expect, type Page} from '@playwright/test';
async function study(page: Page) {
  await page.goto('/');
  await page.getByRole('button', {name: 'Open regional study'}).click();
  await expect(page.getByRole('navigation', {name: 'Study activities'})).toBeVisible();
}
test('selection leaves the structure browser and search in place', async ({page}) => {
  await study(page);
  const search = page.getByRole('searchbox', {name: 'Search structures'});
  await expect(search).toBeVisible();
  await expect(page.getByRole('combobox', {name:'Search scope'})).toBeVisible();
  const before = await search.boundingBox();
  const list = page.getByLabel('Region structures', {exact:true});
  await expect(list.locator('.structure-row-main > button').first()).toContainText('Scapula');
  await list.locator('.structure-row-main > button').first().click();
  await expect(page.getByRole('complementary', {name:'Selected structure'})).toBeVisible();
  expect(await search.boundingBox()).toEqual(before);
  await expect(page.getByRole('button', {name:'Focus', exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('complementary', {name:'Selected structure'})).toHaveCount(0);
  await expect(list.locator('[aria-pressed=true]')).toHaveCount(0);
});
test('filters stay visible as removable chips and scene tools expose active state', async ({page}) => {
  await study(page);
  await page.getByRole('button', {name:'Filters',exact:true}).click();
  await page.getByRole('combobox', {name:'System',exact:true}).selectOption('skeletal');
  await page.getByRole('button', {name:'Filters',exact:true}).click();
  await page.getByRole('button', {name:'Remove system filter'}).click();
  await expect(page.getByRole('button', {name:'Remove system filter'})).toHaveCount(0);
  await page.getByRole('button', {name:'Appearance',exact:true}).click();
  await page.getByRole('combobox', {name:'Cutaway plane',exact:true}).selectOption('x');
  await page.getByRole('button', {name:'Close tools'}).click();
  await page.getByRole('button', {name:'Turn off cutaway'}).click();
  await expect(page.getByRole('button', {name:'Turn off cutaway'})).toHaveCount(0);
});
test('phone uses one resizable sheet and returns to the same search', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await study(page);
  const search = page.getByRole('searchbox', {name:'Search structures'});
  await search.fill('a');
  await page.getByLabel('Region structures', {exact:true}).locator('.structure-row-main > button').first().click();
  await expect(search).toBeHidden();
  await page.getByRole('button', {name:'Back to structures'}).click();
  await expect(search).toHaveValue('a');
  await page.getByRole('button', {name:'Collapse study panel'}).click();
  await expect(search).toBeHidden();
  await page.getByRole('button', {name:'Expand study panel'}).click();
  await expect(search).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('camera reframes above the phone sheet after a desktop resize', async ({page}) => {
  await study(page);
  await page.locator('.loading').waitFor({state:'hidden'});
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('human-atlas.workspace.v1')??'{}').scene?.camera?.viewOffset?.fullWidth)).toBe(1440);
  await page.setViewportSize({width:390,height:844});
  const area=studyViewport(390,844,{panel:'browse',inspector:false,sheet:'half'});
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('human-atlas.workspace.v1')??'{}').scene?.camera?.viewOffset?.offsetY)).toBeCloseTo(844/2-(area.top+area.bottom)/2,1);
});

test('scene tools keep a restored user orbit and receive keyboard focus', async ({page}) => {
  await study(page);
  await page.locator('.loading').waitFor({state:'hidden'});
  const pose=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('human-atlas.workspace.v1')??'{}').scene?.camera);
  await expect.poll(async()=>!!await pose()).toBe(true);
  const initial=await pose();
  const before={...initial,position:[-1.2,1.6,2.8]};
  const workspace=await page.evaluate(()=>JSON.parse(localStorage.getItem('human-atlas.workspace.v1')!));
  workspace.scene.camera=before;
  await page.goto('/#scene='+encodeURIComponent(JSON.stringify(workspace)));
  await page.reload();
  await expect(page.getByRole('navigation',{name:'Study activities'})).toBeVisible();
  await page.locator('.loading').waitFor({state:'hidden'});
  const direction=(p:{position:number[];target:number[]})=>{const v=p.position.map((x,i)=>x-p.target[i]),n=Math.hypot(...v);return v.map(x=>x/n);};
  const appearance=page.getByRole('button',{name:'Appearance',exact:true});
  await appearance.focus();await appearance.press('Enter');
  await expect(page.getByRole('heading',{name:'Appearance',exact:true})).toBeFocused();
  await expect.poll(async()=>Math.hypot(...direction(await pose()).map((x,i)=>x-direction(before)[i]))).toBeLessThan(.02);
  await page.getByRole('button',{name:'Close tools'}).click();
  await expect(appearance).toBeFocused();
});

test('phone history and wide activity content remain within the sheet', async ({page}) => {
  await page.setViewportSize({width:390,height:844});await study(page);
  await expect(page.getByRole('button',{name:'Back / Undo',exact:true})).toBeVisible();
  for(const name of ['Library','Review']) {
    await page.getByRole('navigation',{name:'Study activities'}).getByRole('button',{name:new RegExp(`^${name}`)}).click();
    const panel=await page.getByRole('complementary',{name:'Study controls'}).boundingBox();
    const sheet=await page.locator('.study-sheet').boundingBox();
    expect(panel!.x+panel!.width).toBeLessThanOrEqual(sheet!.x+sheet!.width);
  }
});

test('Explorer replaces the floating tools menu with footer shortcuts', async ({page}) => {
  await page.goto('/');
  await expect(page.getByText('Explore tools',{exact:true})).toHaveCount(0);
  await page.locator('footer').getByText('Shortcuts',{exact:true}).click();
  await expect(page.getByRole('heading',{name:'Keyboard shortcuts'})).toBeVisible();
  await expect(page.locator('.footer-shortcuts-card').getByText('Undo',{exact:true})).toBeVisible();
});
