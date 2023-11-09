fpath+=( /Users/fkabs/.cache/antidote/romkatv/powerlevel10k )
fpath+=( /Users/fkabs/.cache/antidote/agkozak/zsh-z )
source /Users/fkabs/.cache/antidote/agkozak/zsh-z/zsh-z.plugin.zsh
if ! (( $+functions[zsh-defer] )); then
  fpath+=( /Users/fkabs/.cache/antidote/romkatv/zsh-defer )
  source /Users/fkabs/.cache/antidote/romkatv/zsh-defer/zsh-defer.plugin.zsh
fi
fpath+=( /Users/fkabs/.cache/antidote/zsh-users/zsh-autosuggestions )
zsh-defer source /Users/fkabs/.cache/antidote/zsh-users/zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
fpath+=( /Users/fkabs/.cache/antidote/zsh-users/zsh-completions/src )
fpath+=( /Users/fkabs/.cache/antidote/zsh-users/zsh-history-substring-search )
zsh-defer source /Users/fkabs/.cache/antidote/zsh-users/zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
fpath+=( /Users/fkabs/.cache/antidote/zsh-users/zsh-syntax-highlighting )
zsh-defer source /Users/fkabs/.cache/antidote/zsh-users/zsh-syntax-highlighting/zsh-syntax-highlighting.plugin.zsh
