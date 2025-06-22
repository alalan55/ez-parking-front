<template>
  <table class="flex-1 border border-[#cdcdcd] rounded-lg">
    <thead>
      <tr class="bg-slate-50">
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-[400px] text-sm font-medium leading-normal"
        >
          Space ID
        </th>
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-60 text-sm font-medium leading-normal"
        >
          Status
        </th>
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-[400px] text-sm font-medium leading-normal"
        >
          Vehicle
        </th>
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-[400px] text-sm font-medium leading-normal"
        >
          Customer
        </th>
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-[400px] text-sm font-medium leading-normal"
        >
          Arrival
        </th>
        <th
          class="px-4 py-3 text-left text-[#0d151c] w-[400px] text-sm font-medium leading-normal"
        >
          Departure
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-t-[#cedce8]">
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d151c] text-sm font-normal leading-normal"
        >
          A1
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal"
        >
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal w-full"
          >
            <span class="truncate">Available</span>
          </button>
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-360 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-480 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-600 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-720 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
      </tr>
      <tr class="border-t border-t-[#cedce8]">
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d151c] text-sm font-normal leading-normal"
        >
          A2
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal"
        >
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal w-full"
          >
            <span class="truncate">Occupied</span>
          </button>
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-360 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          Car
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-480 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          Sarah Miller
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-600 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          10:00 AM
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-720 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          12:00 PM
        </td>
      </tr>
      <tr class="border-t border-t-[#cedce8]">
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d151c] text-sm font-normal leading-normal"
        >
          A3
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal"
        >
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal w-full"
          >
            <span class="truncate">Reserved</span>
          </button>
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-360 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-480 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          David Lee
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-600 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          11:00 AM
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-720 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          1:00 PM
        </td>
      </tr>
      <tr class="border-t border-t-[#cedce8]">
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d151c] text-sm font-normal leading-normal"
        >
          B1
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal"
        >
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal w-full"
          >
            <span class="truncate">Available</span>
          </button>
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-360 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-480 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-600 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-720 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          N/A
        </td>
      </tr>
      <tr class="border-t border-t-[#cedce8]">
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d151c] text-sm font-normal leading-normal"
        >
          B2
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal"
        >
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal w-full"
          >
            <span class="truncate">Occupied</span>
          </button>
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-360 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          Truck
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-480 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          Emily Chen
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-600 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          9:00 AM
        </td>
        <td
          class="table-9587dbd4-d5e4-45d7-afff-f753f2bf1082-column-720 h-[72px] px-4 py-2 w-[400px] text-[#49749c] text-sm font-normal leading-normal"
        >
          11:00 AM
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup></script>

<style></style>
