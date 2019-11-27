echo -e 'User-agent: * \nAllow: /' > build/knowledge-base/robots.txt
for var in $(find .  -iname "*.html" |grep -v /en/); \
do \
sed -i 's/html lang=""/html lang="zh-CN"/' "$var"; \
sed -i 's/html lang="en"/html lang="zh-CN"/' "$var"; \
sed -i 's!https://unpkg.com/vanilla-back-to-top@7.1.14/dist/vanilla-back-to-top.min.js!https://cdn.jsdelivr.net/npm/vanilla-back-to-top@7.1.14/dist/vanilla-back-to-top.min.js!' "$var"; \
done