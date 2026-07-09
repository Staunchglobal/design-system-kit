import prompts from 'prompts'

export async function confirm(message: string, yes: boolean): Promise<boolean> {
  if (yes) return true
  const res = await prompts({ type: 'confirm', name: 'ok', message, initial: true })
  return !!res.ok
}
