import {test,expect} from '@playwright/test';

test('Explorer rail separates rotation directions and has one reset',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Open regional study'})).toBeEnabled();
  const rail=page.getByRole('navigation',{name:'Explorer tools'});
  await rail.getByRole('button',{name:'Auto rotation',exact:true}).click();
  await page.getByRole('button',{name:'Clockwise',exact:true}).click();
  await expect(page.getByRole('button',{name:'Clockwise',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Counterclockwise',exact:true}).click();
  await expect(page.getByRole('button',{name:'Counterclockwise',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Stop rotation',exact:true}).click();
  await expect(page.getByRole('button',{name:'Stop rotation',exact:true})).toBeDisabled();
  await page.keyboard.press('Escape');
  await rail.getByRole('button',{name:'Appearance and cutaway',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Cutaway plane',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Export annotated PNG'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:/reset/i})).toHaveCount(1);
});
