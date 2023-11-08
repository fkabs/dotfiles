fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/bzr.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/cli.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/clipboard.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/compfix.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/completion.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/correction.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/diagnostics.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/directories.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/functions.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/git.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/grep.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/history.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/key-bindings.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/misc.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/nvm.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/prompt_info_functions.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/spectrum.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/termsupport.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/theme-and-appearance.zsh
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/lib/vcs_info.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/asdf )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/asdf/asdf.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/direnv )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/direnv/direnv.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/git )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/git/git.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/jsontools )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/jsontools/jsontools.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/macos )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/macos/macos.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/pip )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/pip/pip.plugin.zsh
fpath+=( /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/z )
source /Users/fkabs/.antidote/ohmyzsh/ohmyzsh/plugins/z/z.plugin.zsh
fpath+=( /Users/fkabs/.antidote/romkatv/powerlevel10k )
if ! (( $+functions[zsh-defer] )); then
  fpath+=( /Users/fkabs/.antidote/romkatv/zsh-defer )
  source /Users/fkabs/.antidote/romkatv/zsh-defer/zsh-defer.plugin.zsh
fi
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-autosuggestions )
zsh-defer source /Users/fkabs/.antidote/zsh-users/zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-completions/src )
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-history-substring-search )
source /Users/fkabs/.antidote/zsh-users/zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-syntax-highlighting )
zsh-defer source /Users/fkabs/.antidote/zsh-users/zsh-syntax-highlighting/zsh-syntax-highlighting.plugin.zsh
