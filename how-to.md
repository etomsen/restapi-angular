##How to create a separate bower module##

1. copy all module files to a separate foler
2. run "bower init" and setup a bower component
3. add/update dependencies
4. init a git repo: git init .
5. git add .
6. git commit -m "v1.0.0"
7. git tag v1.0.0 (tag will be the actual verison of a bower component)
8. git remote add origin ...
9. git push -u origin master

---

###Now, try to install it###

1. bower install etomsen/restapi-angular

---

###Register a component, so it will be  available for search###
1.  bower register angular-my-component git@github.com:your-user-name/your-repo-name.git
2. Now, you can istall just by component name (without github username): bower install angular-my-component
3. use "bower link" in the component folder to temporaly link bower repository to your local foler (for teting)


###TODO###

1. ~~update the angular dependency to 1.3~~
2. ~~remove any "tao" string from the component~~
3. ~~transform restapi.factory to restapi.provider. make it configurable: url~~
4. release the 1.0.1 version on bower
5. test new provider and factory
