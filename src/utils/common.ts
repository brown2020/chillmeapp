const toPlainObject = <T = object>(obj: object) => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

export { toPlainObject };
