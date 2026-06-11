export function calculateExpression(expression) {
  const source = normalizeExpression(expression);
  if (!source.trim()) {
    throw new Error("Bitte gib eine Rechnung ein.");
  }
  if (!/^[0-9+\-*/().\s]+$/.test(source)) {
    throw new Error("Ungueltige Zeichen in der Rechnung.");
  }

  const parser = createParser(source);
  const value = parser.parseExpression();
  parser.skipWhitespace();
  if (!parser.isDone()) {
    throw new Error("Die Rechnung ist unvollstaendig oder ungueltig.");
  }
  if (!Number.isFinite(value)) {
    throw new Error("Das Ergebnis ist nicht berechenbar.");
  }

  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Object.freeze({ value: rounded, display: rounded.toFixed(2) });
}

function normalizeExpression(expression) {
  return String(expression ?? "")
    .replace(/[\u2019']/g, "")
    .replace(/,/g, ".")
    .replace(/[xX\u00d7]/g, "*")
    .replace(/\u00f7/g, "/");
}

function createParser(source) {
  let index = 0;

  function skipWhitespace() {
    while (/\s/.test(source[index] ?? "")) index += 1;
  }

  function parseExpression() {
    let value = parseTerm();
    while (true) {
      skipWhitespace();
      const operator = source[index];
      if (operator !== "+" && operator !== "-") return value;
      index += 1;
      const next = parseTerm();
      value = operator === "+" ? value + next : value - next;
    }
  }

  function parseTerm() {
    let value = parseFactor();
    while (true) {
      skipWhitespace();
      const operator = source[index];
      if (operator !== "*" && operator !== "/") return value;
      index += 1;
      const next = parseFactor();
      if (operator === "/" && next === 0) {
        throw new Error("Division durch null ist nicht erlaubt.");
      }
      value = operator === "*" ? value * next : value / next;
    }
  }

  function parseFactor() {
    skipWhitespace();
    const current = source[index];
    if (current === "+" || current === "-") {
      index += 1;
      const value = parseFactor();
      return current === "-" ? -value : value;
    }
    if (current === "(") {
      index += 1;
      const value = parseExpression();
      skipWhitespace();
      if (source[index] !== ")") {
        throw new Error("Schliessende Klammer fehlt.");
      }
      index += 1;
      return value;
    }
    return parseNumber();
  }

  function parseNumber() {
    skipWhitespace();
    const match = source.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (!match) {
      throw new Error("Zahl erwartet.");
    }
    index += match[0].length;
    return Number(match[0]);
  }

  return Object.freeze({
    parseExpression,
    skipWhitespace,
    isDone: () => index >= source.length,
  });
}