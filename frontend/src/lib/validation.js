export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function passwordGuidance(password) {
  const value = String(password || "");
  const rules = [
    { id: "length", label: "At least 8 characters", ok: value.length >= 8 },
    { id: "letter", label: "Contains a letter", ok: /[A-Za-z]/.test(value) },
    { id: "number", label: "Contains a number", ok: /\d/.test(value) },
  ];
  const score = rules.filter((rule) => rule.ok).length;
  const label = score <= 1 ? "Weak" : score === 2 ? "Okay" : "Strong";
  return { rules, score, label, valid: rules.every((rule) => rule.ok) };
}

export function validateDateRange(start, end) {
  if (!start || !end) return true;
  return start <= end;
}
