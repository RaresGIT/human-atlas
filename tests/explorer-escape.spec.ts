import {test,expect} from '@playwright/test';

test('one Escape dismisses Explorer details and clears the selected anatomy',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Open regional study'})).toBeEnabled();
  const visiblePieces=page.getByRole('region',{name:'Anatomical layers'}).locator('.panel-foot > span');
  const originalCount=await visiblePieces.innerText();
  await page.getByRole('button',{name:'Search anatomy',exact:true}).click();
  await page.getByRole('combobox',{name:'Search named anatomical structures'}).fill('humerus');
  await page.getByRole('option',{name:'Humerus 2 pieces',exact:true}).click();
  const details=page.getByRole('dialog');
  await expect(details.getByRole('heading',{name:'Humerus',exact:true})).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(details).toBeHidden();
  // H hides a retained selection, so the visible count also checks deselection.
  await page.keyboard.press('h');
  await expect(visiblePieces).toHaveText(originalCount);
});

test('selection Hide and Layers Restore remain available without shortcuts',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Open regional study'})).toBeEnabled();
  const layers=page.getByRole('region',{name:'Anatomical layers'});
  const count=layers.locator('.panel-foot > span'),original=await count.innerText();
  await page.getByRole('button',{name:'Search anatomy',exact:true}).click();
  await page.getByRole('combobox',{name:'Search named anatomical structures'}).fill('humerus');
  await page.getByRole('option',{name:'Humerus 2 pieces',exact:true}).click();
  await page.getByRole('button',{name:'Hide structure',exact:true}).click();
  await expect(count).not.toHaveText(original);
  await layers.getByRole('button',{name:/hidden · Restore/}).click();
  await expect(count).toHaveText(original);
});
