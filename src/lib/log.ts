import pc from 'picocolors'

export const log = {
  info: (msg: string) => console.log(pc.cyan('•'), msg),
  step: (msg: string) => console.log(pc.bold(pc.cyan('→')), msg),
  success: (msg: string) => console.log(pc.green('✓'), msg),
  warn: (msg: string) => console.log(pc.yellow('!'), msg),
  error: (msg: string) => console.log(pc.red('✗'), msg),
  skip: (msg: string) => console.log(pc.dim('·'), pc.dim(msg)),
  title: (msg: string) => console.log('\n' + pc.bold(pc.underline(msg))),
  blank: () => console.log(''),
}
