scp -r src/ docs/
scp build/contracts/* docs/
git add
git commit -m "Compile Assest for Github pages"
git push -u origin master
