export const reduceData = (data: any) => {
    return data.reduce((acc: any, curr: any) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  };
  
  export const modifyPermissions = (pers: string[]) => {
    const h1 = [] as any;
    const h2 = [] as any;
    const h3 = [] as any;
    pers.forEach((item: any) => {
      const host = item.split(".")[1];
      const perRecord = item.split(".")[2];
      const permissions = item.split(".")?.at(-1);
      h1.push(host);
      h2.push(perRecord);
      h3.push(permissions);
    });
  
    return {
      host: Array.from(new Set([...h1])),
      target: Array.from(new Set([...h2])),
      pers: Array.from(new Set([...h3])),
      recordInMethods: reduceData(h3),
    };
  };
  
  export function matchingTwoObject(obj1: any, ob2: any): any[] {
    const matchingKeys = [];
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(ob2);
  
    for (const key of keys1) {
      if (keys2.includes(key) && obj1[key] === ob2[key]) {
        matchingKeys.push(key);
      }
    }
    return matchingKeys;
  }
  
  export function parseData(data: string[]) {
    if (!data) return;
    const payload = [] as any;
  
    const firstLetter = data.map((i: any) => i.split(".")[0])[0];
    const concatF = `${firstLetter}.`;
    const removePer = data.map((i: any) => i.replace(concatF, ""));
    const newArray = removePer.map((ii: any) => ii.split("."));
    const { pers } = modifyPermissions(data);
  
    newArray.forEach((item: any) => {
      const [group, subgroup, permission] = item;
      let existingGroup = payload.find(
        (obj: any) => Object.keys(obj)[0] === group,
      );
  
      if (!existingGroup) {
        existingGroup = {};
        existingGroup[group] = [];
        payload.push(existingGroup);
      }
  
      let existingSubgroup = existingGroup[group].find(
        (obj: any) => Object.keys(obj)[0] === subgroup,
      );
  
      if (!existingSubgroup) {
        existingSubgroup = {};
        existingSubgroup[subgroup] = Array(pers.length).fill(null);
        existingGroup[group].push(existingSubgroup);
      }
  
      const permissionIndex = pers.indexOf(permission);
      existingSubgroup[subgroup][permissionIndex] = {
        value: `${concatF}${item.join(".")}`,
        title: permission,
      };
    });
  
    return payload;
  }
  