import * as execa from 'execa'

export async function runScript(script: string, renderer?: any, cwd?: string) {
  let message = ''
  echoToTerminal(renderer, `Executing: ${script}`)
  try {
    const scriptStdout = await execa.command(script, {
      cwd,
      windowsVerbatimArguments: true,
    })
    echoToTerminal(renderer, scriptStdout.stdout)
    message = scriptStdout.all
  } catch (error) {
    echoToTerminal(this.renderer, sanitizeStdOut(error.message))
    return error.message
  }
  return message
}

export function echoToTerminal(renderer: any, message: string): void {
  if (renderer) {
    renderer.sendText(`echo "${message}"`)
  }
}

export function sanitizeStdOut(text: any): string {
  return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
}

export function colorText(text: string): string {
  let output = ''
  let colorIndex = 1
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === ' ' || char === '\r' || char === '\n') {
      output += char
    } else {
      output += `\x1b[3${colorIndex++}m${text.charAt(i)}\x1b[0m`
      if (colorIndex > 6) {
        colorIndex = 1
      }
    }
  }
  return output
}
