// src/utilsCounterHelpers.ts
export function getCounterFields(data: any) {
  // `data` is the object returned by useSuiClientQuery (the .data property; i.e. the Sui object representation)
  if (!data?.content || data.content?.dataType !== 'moveObject') return null;
  return data.content.fields as { value: number; owner: string };
}
