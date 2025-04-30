module.exports = EventsHandler = async (event, client) => {
    try {
        const activateEvents = (await client.DB.get('events')) || [];
        const groupMetadata = await client.groupMetadata(event.id);
        
        if (!activateEvents.includes(event.id)) return;

        // Custom messages arrays
        const greetings = [
            '{x} has joined the party!',
            'A wild {x} appeared!',
            '{x} hopped into the group!',
            '{x} has arrived!',
            'Welcome to the group, {x}. Hope you brought pizza.',
            "{x} has arrived. Let's have a beer!",
            '{x} has arrived. May I suggest a nice cold one?',
            "Well, {x}, it's about time you arrived!",
            'Um, {x} has arrived. I wonder if they brought their own cup of tea?',
            'Very funny {x}, I expected you to be here a while.',
            'Good to see you, {x}.',
            "It's a pleasure to see you {x}."
        ];

        const farewells = [
            '{x} has left the party.',
            '{x} has left the group.',
            '{x} has left the group. I hope you enjoyed your stay.',
            "Well {x}, it's about time you left.",
            'Bye {x}.',
            "It's been nice meeting you {x}.",
            'Take care {x}.',
            'Later {x}.',
            'Catch you later {x}.',
            'Au Revoir {x}.',
            'Till next time {x}.',
            'We will meet again {x}.',
            "I'm looking forward to seeing you {x}.",
            'I hope you brought a souvenir {x}.'
        ];

        const demotions = [
            "{x}, you're fired!",
            "Adminship isn't for you {x}.",
            "{x} you had a good run, but you're no longer an admin.",
            "Well, I don't know how to tell you this, but {x} has been demoted.",
            '{x} has been demoted. I hope you enjoyed your admin run.'
        ];

        const promotions = [
            "{x}, you're an admin!",
            "Welcome {x}, you're an admin!",
            "{x} you're an admin! I hope you take care of us",
            "Well, you're an admin now {x}.",
            "Looks like you're an admin now {x}."
        ];

        let text = '';
        if (event.action === 'add') {
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            // Replace {x} with user mentions
            const mentions = event.participants.map((jid) => `@${jid.split('@')[0]}`);
            text = randomGreeting.replace(/{x}/g, mentions.join(', '));
        } else if (event.action === 'remove') {
            const randomFarewell = farewells[Math.floor(Math.random() * farewells.length)];
            // Replace {x} with user mentions
            const mentions = event.participants.map((jid) => `@${jid.split('@')[0]}`);
            text = randomFarewell.replace(/{x}/g, mentions.join(', '));
        } else if (event.action === 'promote') {
            const randomPromotion = promotions[Math.floor(Math.random() * promotions.length)];
            // Replace {x} with user mentions
            const mentions = event.participants.map((jid) => `@${jid.split('@')[0]}`);
            text = randomPromotion.replace(/{x}/g, mentions.join(', '));
        } else if (event.action === 'demote') {
            const randomDemotion = demotions[Math.floor(Math.random() * demotions.length)];
            // Replace {x} with user mentions
            const mentions = event.participants.map((jid) => `@${jid.split('@')[0]}`);
            text = randomDemotion.replace(/{x}/g, mentions.join(', '));
        }

        await client.sendMessage(event.id, {
            text,
            mentions: event.participants
        });
    } catch (error) {
        console.error('Error occurred:', error);
        // Handle the error accordingly, e.g., logging, notifying, etc.
    }
};
