set -x

list=(
  "expo/expo" 
  "th3rdwave/react-native-safe-area-context"
  necolas/react-native-web
  react-native-async-storage/async-storage
  react-navigation/react-navigation
  software-mansion/react-native-gesture-handler
  software-mansion/react-native-reanimated
  software-mansion/react-native-screens
  software-mansion/react-native-svg
)

for repo in ${list[*]}; do
  if [ ! -d "$repo" ]; then
    git submodule add --depth 1 "https://github.com/$repo.git" "$repo"
  fi
done

git submodule update --recursive --depth 1
