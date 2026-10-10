// Commit format: type(scope): <emoji> [nama] subject
//   feat(collector): ✨ [kodok] tambah DNS collector
// `rules` is checked by commitlint (husky commit-msg hook), `prompt` drives `npm run commit` (czg).
const { execSync } = require('node:child_process')

const types = [
  { value: 'feat', emoji: '✨', name: 'feat:     ✨ fitur baru' },
  { value: 'fix', emoji: '🐛', name: 'fix:      🐛 perbaikan bug' },
  { value: 'wip', emoji: '🚧', name: 'wip:      🚧 masih dikerjakan' },
  { value: 'docs', emoji: '📝', name: 'docs:     📝 dokumentasi' },
  { value: 'style', emoji: '💄', name: 'style:    💄 format/tampilan, tanpa ubah logika' },
  { value: 'refactor', emoji: '♻️', name: 'refactor: ♻️  ubah struktur kode, tanpa fitur/fix' },
  { value: 'perf', emoji: '⚡', name: 'perf:     ⚡ performa' },
  { value: 'test', emoji: '✅', name: 'test:     ✅ tambah/ubah test' },
  { value: 'build', emoji: '📦', name: 'build:    📦 build system/dependency' },
  { value: 'ci', emoji: '🎡', name: 'ci:       🎡 CI/CD' },
  { value: 'chore', emoji: '🔨', name: 'chore:    🔨 tugas lain' },
  { value: 'revert', emoji: '⏪', name: 'revert:   ⏪ batalkan commit' },
]

// Tag name: `git config cz.name kodok` to set a short one, else git user.name.
function whoami() {
  for (const key of ['cz.name', 'user.name']) {
    try {
      const name = execSync(`git config ${key}`, { encoding: 'utf8' }).trim()
      if (name) return name
    } catch {}
  }
  return 'anon'
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-emoji-tag': ({ subject }) => [
          /^\S+ \[[^\]]+\] \S/u.test(subject ?? ''),
          'subject harus diawali "<emoji> [nama] ", contoh: "✨ [kodok] tambah DNS collector". Pakai `npm run commit`.',
        ],
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', types.map((t) => t.value)],
    'subject-emoji-tag': [2, 'always'],
  },
  prompt: {
    types,
    useEmoji: true,
    emojiAlign: 'center',
    allowEmptyScopes: true,
    skipQuestions: ['footerPrefix', 'footer'],
    formatMessageCB: ({ type, scope, markBreaking, emoji, subject, defaultHeader, defaultMessage }) => {
      const header = `${type}${scope ? `(${scope})` : ''}${markBreaking}: ${emoji} [${whoami()}] ${subject}`
      return defaultMessage.replace(defaultHeader, header)
    },
  },
}
