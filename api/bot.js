const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_LINK = process.env.CHANNEL_LINK;
const BOT_USERNAME = process.env.BOT_USERNAME;
const BOT_ID = Number(process.env.BOT_ID);

const userStats = {};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    })
  });
}

function randomReply(name) {
  const replies = [
    `Oye ${name}, aaj bade style me message kar rahe ho 😏`,
    `${name}, tum interesting lag rahe ho 👀`,
    `Aisa mat bolo ${name}, mujhe sharam aa rahi hai 😳`,
    `${name}, tumse baat karke acha feel hota hai 😌`,
    `Oho ${name}, hero entry ho gayi 😎`,
    `Tum mujhe ignore karne ka try mat karo ${name} 😤`,
    `${name}, agar itna sweet ho to daily likhna padega ab 😏`
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

function handleMyChatMember(update) {
  const mc = update.my_chat_member;
  if (!mc) return;

  const chat = mc.chat;
  const fromUser = mc.from;
  const target = mc.new_chat_member?.user;

  if (!target || target.id !== BOT_ID) return;

  if (chat.type === "group" || chat.type === "supergroup") {
    const userId = fromUser.id;

    if (!userStats[userId]) userStats[userId] = { groupsAdded: 0 };
    userStats[userId].groupsAdded++;

    sendMessage(
      chat.id,
      `Thanks ${fromUser.first_name} for adding me ❤️\n\nAb main yaha masti + chatting karungi 😎\nAur haan, meri favourite jagah: ${CHANNEL_LINK}`
    );
  }
}

async function handlePrivateMessage(msg) {
  const userId = msg.from.id;
  const name = msg.from.first_name;
  const text = msg.text;

  if (!userStats[userId]) userStats[userId] = { groupsAdded: 0 };

  if (userStats[userId].groupsAdded < 3) {
    const left = 3 - userStats[userId].groupsAdded;

    sendMessage(
      msg.chat.id,
      `Hey ${name} 😉\n\nPehle mujhe aur ${left} group me add karo tabhi main tumhe full attention dungi 😏`
    );
  } else {
    sendMessage(
      msg.chat.id,
      `Hello ${name} 😎\nTum bole: "${text}"\n\nAb batao aage kya baat kare? 😉`
    );
  }
}

async function handleGroupMessage(msg) {
  if (!msg.from || msg.from.is_bot) return;

  if (Math.random() > 0.3) return; // 30% chance

  const name = msg.from.first_name;
  const reply = randomReply(name) + `\n\nJoin my favourite place: ${CHANNEL_LINK}`;

  sendMessage(msg.chat.id, reply);
}

module.exports = async (req, res) => {
  try {
    const update = req.body;

    if (update.my_chat_member) handleMyChatMember(update);

    if (update.message) {
      const msg = update.message;

      if (msg.chat.type === "private") {
        await handlePrivateMessage(msg);
      } else {
        await handleGroupMessage(msg);
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(200).json({ ok: true });
  }
};
