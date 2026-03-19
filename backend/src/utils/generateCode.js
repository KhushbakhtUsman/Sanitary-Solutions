export const formatCode = (prefix, serial) => {
  const paddedSerial = String(serial).padStart(3, "0");
  return `${prefix}-${paddedSerial}`;
};
