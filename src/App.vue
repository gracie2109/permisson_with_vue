<template>
  <div class="mt-10">
    <div>
      <label class="form-check-label" for="checkAll"> Check all </label>
      <input
        class="form-check-input border-red-200"
        type="checkbox"
        value="checkAll"
        @click="handleChooseAll"
      />
    </div>
    <table class="table table-border-none table-responsive-md">
      <thead>
        <tr>
          <th>Resource</th>
          <th></th>
          <th v-for="(i, j) in pers" :key="j">
            <div class="d-grid place-items-center gap-2">
              <label class="form-check-label" :for="i">
                {{ i }}
              </label>
              <input
                :id="i"
                class="form-check-input border-red-200"
                type="checkbox"
                :value="i"
                :data-method_selector="i"
                @input="(e) => chooseMethods(e, i)"
                :checked="checkedMethods?.includes(i)"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(i, ii) in newMofify" :key="ii">
          <template v-for="(j, jj) in Object.keys(i)" :key="jj">
            <template v-for="(k, kk) in i[j]" :key="kk">
              <tr class="mb-2">
                <template v-if="i[j].length >= 1 && kk === 0">
                  <td :data-repeat="i[j].length">
                    {{ Object.keys(i).toString() }}
                  </td>
                </template>
                <template v-else>
                  <td :data-repeat="i[j].length"></td>
                </template>
                <td class="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="Object.keys(k).toString()"
                    :data-resource_selector="`${Object.keys(i)}.${Object.keys(k)}`"
                    @input="
                      (event) =>
                        chooseResource(
                          event,
                          `${Object.keys(i)}.${Object.keys(k)}`,
                        )
                    "
                  />
                  <label :for="Object.keys(k).toString()">{{
                    Object.keys(k).toString()
                  }}</label>
                </td>
                <template
                  v-for="(m, mm) in k[Object.keys(k).toString()]"
                  :key="mm"
                >
                  <template v-if="m">
                    <td>
                      <div class="form-check">
                        <input
                          :id="m.value"
                          class="form-check-input border-red-200"
                          type="checkbox"
                          :value="m.value"
                          :data-method="m.value.split('.').at(-1)"
                          v-model="newRoles.permissions"
                          :data-resouce="`${m.value.split('.')[1]}.${m.value.split('.')[2]}`"
                        />
                      </div>
                    </td>
                  </template>
                  <template v-else>
                    <td>
                      <div class="form-check">
                        <input
                          disabled
                          class="form-check-input"
                          type="checkbox"
                        />
                      </div>
                    </td>
                  </template>
                </template>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import {
  modifyPermissions,
  reduceData,
  matchingTwoObject,
  parseData,
} from "./lib";
import { onMounted, reactive, ref, watchEffect } from "vue";

const rawData = [
  "Permission.Indentity.User.Read",
  "Permission.Indentity.User.Create",
  "Permission.Indentity.User.Delete",
  "Permission.Indentity.User.Update",
  "Permission.Indentity.SysLog.Read",
  "Permission.Paylak.Product.Read",
  "Permission.Paylak.Product.Create",
  "Permission.Paylak.Product.Delete",
  "Permission.Paylak.Product.Update",
  "Permission.Paylak.Product.Upload",
  "Permission.Indentity.User.Export",
  "Permission.Tiktok.User.Upload",
  "Permission.Tiktok.Media.Create",
  "Permission.Tiktok.Customer.Upload",
  "Permission.Tiktok.Customer.Create",
];

const { pers } = reactive(modifyPermissions(rawData));
const checkall = ref(false);
const checkedMethods = ref([]);
const checkedResource = ref([]);

const newMofify = reactive(parseData(rawData));
const newRoles = reactive<{name: string, permissions:string[]}>({
  name: "",
  permissions: [],
});

const handleChooseAll = (e) => {
  const checked = e.target.checked;
  if (checked) {
    newRoles.permissions = rawData;
    checkall.value = true;
    checkedMethods.value = pers;
  } else {
    newRoles.permissions = [];
    checkall.value = false;
    checkedMethods.value = [];
  }
};

const chooseMethods = (e, m) => {
  const checked = e.target.checked;
  const inputs = document.querySelectorAll(`input[data-method='${m}']`);
  inputs.forEach((input: any) => {
    const value = input.value;
    if (checked) {
      newRoles.permissions = [...newRoles.permissions, value];
      checkedMethods.value = Array.from(new Set([...checkedMethods.value, m]));
    } else {
      const newPer = newRoles.permissions.filter((i) => i !== value);
      const filterMethods = checkedMethods.value.filter((j) => j !== m);

      newRoles.permissions = newPer;
      checkedMethods.value = filterMethods;
    }
  });
};

const chooseResource = (e, target) => {
  const checked = e.target.checked;
  const inputs = document.querySelectorAll(`input[data-resouce='${target}']`);
  inputs.forEach((input: any) => {
    const value = input.value;
    if (checked) {
      newRoles.permissions = [...newRoles.permissions, value];
      checkedResource.value = Array.from(
        new Set([...checkedResource.value, target]),
      );
    } else {
      const newPer = newRoles.permissions.filter((i) => i !== value);
      const filterMethods = checkedResource.value.filter((j) => j !== target);

      newRoles.permissions = newPer;
      checkedResource.value = filterMethods;
    }
  });
};

watchEffect(() => {
  if (newRoles.permissions.length === rawData.length) {
    checkall.value = true;
  } else {
    checkall.value = false;
  }
  const test = reduceData(
    newRoles.permissions.flatMap((i) => i.split(".")?.at(-1)),
  );
  const { recordInMethods } = modifyPermissions(rawData);
  const newMatch = matchingTwoObject(recordInMethods, test);
  console.log("newMatch", newMatch);
  checkedMethods.value = newMatch;
});

onMounted(async () => {
  if (newRoles.permissions.length === rawData.length) {
    checkall.value = true;
  } else {
    checkall.value = false;
  }
});
</script>
<style lang="css" scoped>
.pl-4 {
  padding-left: 4rem;
}

.w-12 {
  width: 56px;
  width: 56px;
}

.show {
  max-width: 840px;
  overflow: auto;
}

.mr-2 {
  margin-right: 0.5rem;
}
.d-flex {
  display: flex;
}

.gap-3 {
  padding: 0.75rem;
}

.align-items-center {
  align-content: center;
  align-items: center;
}

.my-3 {
  margin-bottom: 0.75rem;
}
.p-3 {
  padding: 0.75rem;
}
table {
  max-height: 50px !important;
  overflow: auto !important;
}

td,
tr {
  border-bottom: none !important;
}

.mt-10 {
  margin-top: 10rem;
}
</style>
