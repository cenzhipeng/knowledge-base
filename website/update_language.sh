for var in $(find .  -iname "*.html" |grep -v /en/); \
do \
sed -i 's/html lang=""/html lang="zh-CN"/' $var; \
sed -i 's/html lang="en"/html lang="zh-CN"/' $var; \
done