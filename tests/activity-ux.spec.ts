import {test,expect,type Page} from '@playwright/test';

async function openActivity(page:Page,name:RegExp){
  await page.goto('/');
  await page.getByRole('button',{name:'Open regional study'}).click();
  await page.getByRole('navigation',{name:'Study activities'}).getByRole('button',{name}).click();
}

test('practice separates accessible mode selection from starting a session',async({page})=>{
  await openActivity(page,/^Practice$/);
  const setup=page.getByRole('region',{name:'Practice setup'});
  await expect(setup.getByRole('radio')).toHaveCount(3);
  await expect(setup.getByRole('radio',{name:'Name a structure',exact:true})).toBeChecked();
  const find=setup.getByRole('radio',{name:'Find a structure',exact:true});
  await find.check();
  await expect(setup).toBeVisible();
  await expect(find).toBeChecked();
  await find.press('ArrowRight');
  await expect(setup.getByRole('radio',{name:'Find in regional anatomy',exact:true})).toBeChecked();
  await find.check();
  await setup.getByText('How practice works',{exact:true}).click();
  await expect(setup.getByText(/Case, spacing, and punctuation are ignored/)).toBeVisible();
  await setup.getByRole('combobox',{name:'Session length'}).selectOption('5');
  await setup.getByRole('button',{name:'Start practice',exact:true}).click();
  const question=page.getByRole('region',{name:'Identification question'});
  await expect(question.getByText('Question 1 of 5',{exact:false})).toBeVisible();
  await expect(question.getByRole('heading',{name:/^Find:/})).toBeFocused();
  await question.getByRole('button',{name:'Reveal answer',exact:true}).click();
  await expect(question.getByText('Answer revealed',{exact:true})).toBeVisible();
  await question.getByRole('button',{name:'End practice',exact:true}).click();
});

test('review keeps scheduling and transfers in accessible disclosures',async({page})=>{
  await openActivity(page,/^Review/);
  const review=page.getByRole('region',{name:'Review collection'});
  await expect(review.getByRole('heading',{name:'Review',exact:true})).toBeVisible();
  await expect(review.getByText('0 due now',{exact:true})).toBeVisible();
  await expect(review.getByText(/Correct answers return after/)).toBeHidden();
  await review.getByText('How review scheduling works',{exact:true}).click();
  await expect(review.getByText(/Correct answers return after/)).toBeVisible();
  await expect(review.getByRole('button',{name:'Import revision'})).toBeHidden();
  await review.getByText('Import & export reviews',{exact:true}).click();
  await expect(review.getByRole('button',{name:'Import revision'})).toBeVisible();
});

test('lessons retain step navigation, source links and reset',async({page})=>{
  await openActivity(page,/^Lessons$/);
  const lessons=page.getByRole('region',{name:'Guided lessons'});
  await lessons.getByRole('button',{name:/^Start /}).first().click();
  await expect(lessons.getByText(/^Step 1 of/)).toBeVisible();
  await expect(lessons.getByRole('button',{name:'Back',exact:true})).toBeDisabled();
  await lessons.getByText('Step sources',{exact:true}).click();
  await expect(lessons.getByRole('link').first()).toBeVisible();
  await lessons.getByRole('button',{name:'Next step',exact:true}).click();
  await expect(lessons.getByText(/^Step 2 of/)).toBeVisible();
  await lessons.getByRole('button',{name:'Reset step',exact:true}).click();
  await expect(lessons.getByText(/^Step 2 of/)).toBeVisible();
  await lessons.getByRole('button',{name:'All lessons',exact:true}).click();
  await expect(lessons.getByRole('button',{name:/^Start /}).first()).toBeVisible();
});
