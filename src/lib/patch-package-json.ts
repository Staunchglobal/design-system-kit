import fs from 'node:fs'

export function addPackageJsonScript(
  filePath: string,
  name: string,
  command: string
): 'added' | 'already-present' {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  json.scripts ??= {}
  if (json.scripts[name]) return 'already-present'
  json.scripts[name] = command
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n')
  return 'added'
}
