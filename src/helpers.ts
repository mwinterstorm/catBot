async function checkActionWords(actions: RegExp[], message: string) {
   
    const help = /\bhelp\b/gi
    for (let i = 0; i < actions.length; i++) {
        if (actions[i].test(message)) {
            return true
        } else if (help.test(message)) {
            return {
                action: 'help',
                actions: [
                    actions
                ]
            }
        } else {
            return false
        }
    }
}

export default {
    checkActionWords,
}