export function literals<const Values extends ReadonlyArray<string>>(...values: Values): Values {
  return values;
}
