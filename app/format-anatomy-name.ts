/** Sentence case for display only; preserve anatomical spelling and acronyms. */
export function formatAnatomyName(name:string|undefined):string {
 return (name??'').replace(/\p{L}/u,letter=>letter.toUpperCase());
}
