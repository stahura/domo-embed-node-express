Setup steps:

1. Copy the repository

2. In your terminal/command line, Navigate to the directory where you copied the repository

3. Type the following command in your terminal: yarn   (this should install the packages you see in package.json) this step is what will enable the API calls using Axios

4. With your terminal in the project directory, type yarn start

5. Your server should now be listening on a port (default is 8081)

6. Separate from this project/directory, your website should be running and your iframe should look like this:
<iframe src="http://localhost:8081/test" width="500" height="500" marginheight="0" marginwidth="0" frameborder="0"></iframe>

7. There are 2 parts of the code where you need to enter the embed ID of your card/dashboard: In line 43: where you see "token":"Wn7lv", and line 71 where you see this: action="https://public.domo.com/cards/Wn7lv?referenceId=1".

8. Keep in mind that your embed URL changes based on whether it's a card or a dashboard. A card looks like: https://public.domo.com/cards/Wn7lv?referenceId=1 , while a dashboard looks like: https://public.domo.com/embed/pages/Wn7lv?referenceId=1

