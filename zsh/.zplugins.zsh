fpath+=( /Users/fkabs/.antidote/romkatv/powerlevel10k )
if ! (( $+functions[zsh-defer] )); then
  fpath+=( /Users/fkabs/.antidote/romkatv/zsh-defer )
  source /Users/fkabs/.antidote/romkatv/zsh-defer/zsh-defer.plugin.zsh
fi
fpath+=( /Users/fkabs/.antidote/zdharma-continuum/fast-syntax-highlighting )
zsh-defer source /Users/fkabs/.antidote/zdharma-continuum/fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh
fpath+=( /Users/fkabs/.antidote/agkozak/zsh-z )
source /Users/fkabs/.antidote/agkozak/zsh-z/zsh-z.plugin.zsh
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-autosuggestions )
zsh-defer source /Users/fkabs/.antidote/zsh-users/zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-completions/src )
fpath+=( /Users/fkabs/.antidote/zsh-users/zsh-history-substring-search )
zsh-defer source /Users/fkabs/.antidote/zsh-users/zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
