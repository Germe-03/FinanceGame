export function searchLearningModules(modules, keyword) {
  const query = normalizeLearningSearchText(keyword);
  return modules
    .filter((module) => !query || normalizeLearningSearchText(module.markdown).includes(query))
    .map((module) => Object.freeze({ id: module.id, name: module.name }));
}

function normalizeLearningSearchText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("de-CH")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u");
}