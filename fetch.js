const { IgApiClient } = require('instagram-private-api');
const readline = require('readline');

const igClient = new IgApiClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptLogin = () => {
  return new Promise((resolve) => {
    rl.question('Enter username: ', (username) => {
      rl.question('Enter password: ', (password) => {
        resolve({ username, password });
      });
    });
  });
};

const loginAndFetchChats = async () => {
  const { username, password } = await promptLogin();

  igClient.state.generateDevice(username);
  try {
    await igClient.simulate.preLoginFlow();
    const userData = await igClient.account.login(username, password); 
    console.log('Logged in:', JSON.stringify(userData, null, 2));

    const chatList = await igClient.feed.directInbox().items(); 
    console.log('Chat list:'); 
    chatList.forEach((chat, index) => {
      console.log(`Chat ${index + 1}:`);
      console.log(`  Title: ${chat.thread_title || 'Unnamed Chat'}`); 
      console.log(`  ID: ${chat.thread_id}`); 
      console.log(`  Last Activity: ${new Date(Number(chat.last_activity_at))}`);
    });

    rl.close(); 
  } catch (error) {
    console.error('Error during login or fetching chats:', error); 
    rl.close(); 
  }
};
loginAndFetchChats();