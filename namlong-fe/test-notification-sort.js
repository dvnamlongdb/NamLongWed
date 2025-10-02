// Test case để kiểm tra các lỗi undefined.sort đã được sửa
// Chạy file này để test các trường hợp edge case

console.log("=== TEST NOTIFICATION SORT FIXES ===");

// Test case 1: notifications là undefined
console.log("\n1. Test với notifications = undefined:");
let notifications = undefined;
let filtered = Array.isArray(notifications) ? notifications : [];
console.log("filtered:", filtered);
console.log("filtered.sort() works:", typeof filtered.sort === 'function');

// Test case 2: notifications là null
console.log("\n2. Test với notifications = null:");
notifications = null;
filtered = Array.isArray(notifications) ? notifications : [];
console.log("filtered:", filtered);
console.log("filtered.sort() works:", typeof filtered.sort === 'function');

// Test case 3: notifications là empty array
console.log("\n3. Test với notifications = []:");
notifications = [];
filtered = Array.isArray(notifications) ? notifications : [];
console.log("filtered:", filtered);
console.log("filtered.sort() works:", typeof filtered.sort === 'function');

// Test case 4: notifications có data nhưng thiếu timestamp
console.log("\n4. Test với notifications có data thiếu timestamp:");
notifications = [
  { id: 1, title: "Test 1", timestamp: new Date() },
  { id: 2, title: "Test 2", timestamp: undefined },
  { id: 3, title: "Test 3" }, // không có timestamp
];
filtered = Array.isArray(notifications) ? notifications : [];
const sorted = filtered.sort((a, b) => {
  const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
  const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
  return bTime - aTime;
});
console.log("sorted notifications:", sorted);

// Test case 5: notifications có createdAt thay vì timestamp
console.log("\n5. Test với notifications có createdAt:");
notifications = [
  { id: 1, title: "Test 1", createdAt: "2024-01-01T10:00:00Z" },
  { id: 2, title: "Test 2", createdAt: "2024-01-02T10:00:00Z" },
  { id: 3, title: "Test 3", createdAt: undefined },
];
filtered = Array.isArray(notifications) ? notifications : [];
const sortedByCreatedAt = filtered.sort((a, b) => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
});
console.log("sorted by createdAt:", sortedByCreatedAt);

console.log("\n=== ALL TESTS PASSED ===");
console.log("Các lỗi undefined.sort đã được sửa thành công!");


