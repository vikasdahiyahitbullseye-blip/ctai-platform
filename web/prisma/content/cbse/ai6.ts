// Class 6 AI chapters: CBSE exercises with the Teacher Handbook's solutions.
import { A, type AiExercise } from "./types";

export const AI6: AiExercise[] = [
  A({
    chapter: 1,
    mcq: [
      ["What is labelled data?", ["Data without any tags", "Data with predefined labels or tags", "Random data", "Incorrect data"], 1],
      ["Who introduced the Turing Test?", ["John McCarthy", "Alan Turing", "Charles Babbage", "Isaac Newton"], 1],
      ["In supervised learning, data is:", ["Unlabelled", "Random", "Labelled", "Deleted"], 2],
      ["Predicting exam marks based on the trained data uses:", ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "All of the above"], 0],
      ["Which of the following is not AI?", ["Voice assistant", "Face recognition", "Traditional traffic signal", "Smart chatbot"], 2],
    ],
    fill: [
      ["Intelligence includes the ability to learn and _____ problems.", ["solve"]],
      ["AI is a technique to make intelligent _____.", ["machines"]],
      ["Automation works on fixed _____ and preset instructions.", ["rules"]],
      ["Unsupervised learning is mainly used for _____.", ["clustering"]],
      ["Machine Learning allows machines to learn from _____.", ["data"]],
    ],
    short: [
      ["Define intelligence in your own words.", "Intelligence is the ability to learn, think, understand and solve problems."],
      ["State two differences between automation and AI.", "1. Automation follows fixed rules; AI learns from data.\n2. Automation gives the same output; AI can change its output."],
      ["What is reinforcement learning?", "Reinforcement learning is a type of learning where machines learn using rewards and penalties."],
      ["Name the three types of Machine Learning.", "Supervised learning, unsupervised learning and reinforcement learning."],
      ["Give two examples of AI used in daily life.", "Voice assistants and face recognition."],
    ],
    apply: [],
    tables: [
      { title: "Identify the type of Machine Learning", choices: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"], rows: [
        ["Grouping customers based on shopping habits without labels", "Unsupervised Learning"],
        ["Predicting house prices based on past labelled data", "Supervised Learning"],
        ["A game AI improving after winning or losing", "Reinforcement Learning"],
        ["Sorting emails into spam and not spam", "Supervised Learning"],
      ] },
      { title: "Classify as AI or Automation", choices: ["AI", "Automation"], rows: [
        ["Traffic light changing at fixed intervals", "Automation"],
        ["Face recognition system", "AI"],
        ["Washing machine with preset timer", "Automation"],
        ["Voice assistant answering questions", "AI"],
      ] },
    ],
  }),
  A({
    chapter: 2,
    mcq: [
      ["A teacher analyses last year's exam results to improve teaching methods. This is an example of:", ["Guesswork", "Using data for decision-making", "Random selection", "Entertainment"], 1],
      ["A fitness app counts your daily steps and shows weekly progress. What type of data is mainly collected?", ["Image data", "Text data", "Numerical data", "Sound data"], 2],
      ["A weather app predicts rain using satellite information. This shows that data helps in:", ["Playing games", "Making future predictions", "Writing stories", "Sending messages"], 1],
      ["A security camera records activities at the school gate. What type of data is mainly collected?", ["Text data", "Video data", "Image data", "Numerical data"], 1],
      ["Which of the following is an example of image data?", ["Your name", "Your address", "Your age", "Your photograph"], 3],
    ],
    fill: [
      ["Data means raw _____ and figures.", ["facts"]],
      ["Tables arrange data in rows and _____.", ["columns"]],
      ["Text data is made up of letters, words, and _____.", ["sentences"]],
      ["Grouping similar kinds of data is called _____.", ["classification"]],
      ["Saving data in secure systems is known as _____.", ["storage", "data storage"]],
    ],
    short: [
      ["What is data?", "Data is raw information that can be processed to get useful information."],
      ["State any two important aspects of data in daily life.", "1. It helps in decision making.\n2. It helps in business growth."],
      ["Name the four main types of data.", "Numerical, text, image and sound."],
      ["What is the difference between a table and a chart?", "A table arranges data in rows and columns; a chart is a graphical representation of data."],
      ["Define classification and labeling in organising data.", "Classification: grouping similar data. Labelling: giving proper names to data."],
    ],
    apply: [
      ["A student measures the height of a plant every week. What type of data is being collected?", "Numerical data"],
      ["A teacher wants to compare the marks of students clearly. Should she use a table or a bar chart? Give one reason.", "A bar chart, because it makes comparison easier."],
      ["A shopping app suggests products based on your previous searches. How is data being used in this situation?", "Data is used to give recommendations."],
      ["Your desktop has many mixed files with random names. What should you do?", "Organise the data into folders."],
    ],
    tables: [
      { title: "Identify the type of data", choices: ["Numerical", "Text", "Image", "Sound"], rows: [
        ["Exam marks", "Numerical"], ["A voice message", "Sound"], ["School ID photo", "Image"], ["Your home address", "Text"], ["Number of students in the class", "Numerical"],
      ] },
    ],
  }),
  A({
    chapter: 3,
    mcq: [
      ["A student notices that every morning, he wakes up, brushes his teeth and eats breakfast in the same order. What does this represent?", ["A random action", "A pattern", "A single event", "A mistake"], 1],
      ["Making observations from data means:", ["Changing the data", "Looking for patterns and key findings", "Making guesses", "Hiding results"], 1],
      ["Arranging data by its attributes to find similar groups is called:", ["Machine learning", "Sorting and Filtering", "Entertainment", "Prediction"], 1],
      ["Drawing a conclusion means:", ["Copying data", "Understanding and applying observations", "Creating confusion", "Repeating the same data"], 1],
      ["Decision-making means:", ["Acting without thinking", "Choosing an action after thinking", "Ignoring facts", "Random guessing"], 1],
    ],
    fill: [
      ["A pattern is a repeated and predictable _____ of elements.", ["sequence"]],
      ["Identifying patterns means looking for repeated _____ or similarities in data.", ["actions"]],
      ["Making observations from data means looking for patterns, trends, and _____ findings.", ["key"]],
      ["Drawing a conclusion means understanding observations to answer a _____.", ["question"]],
      ["Decision making means choosing an action after thinking carefully about the _____ available.", ["information"]],
    ],
    short: [
      ["Define a pattern and give one example from daily life.", "A pattern is a repeated sequence. Example: 2, 4, 6, 8."],
      ["Name any two methods used to recognise repeated actions or events and briefly explain one of them.", "Observation and data visualisation. Observation: watching events repeatedly over time."],
      ["Why is predictability important when identifying patterns?", "Predictability helps us know what will happen next."],
      ["What is statistical analysis used for when studying large datasets?", "Statistical analysis is used to understand large datasets."],
      ["Explain the difference between making an observation and drawing a conclusion with an example.", "Observation: the temperature is higher in the afternoon. Conclusion: afternoons are warmer."],
    ],
    apply: [
      ["A student notices that the temperature is higher in the afternoon than in the morning for several days. What is the student doing?", "Identifying a pattern."],
      ["A student notices that practising every day improves performance in a basketball game. What decision can the student make from this observation?", "To practise daily."],
      ["A class survey shows that more students like cricket than football. What can the teacher conclude from this data?", "Cricket is the most popular sport in the class."],
    ],
    tables: [
      { title: "Identify the method used", choices: ["Time Series Analysis", "Sorting and Filtering", "Data Visualization", "Machine Learning"], rows: [
        ["Watching daily rainfall for a month", "Time Series Analysis"], ["Arranging students by height", "Sorting and Filtering"], ["Using graphs to compare sales", "Data Visualization"],
        ["Studying trends over five years", "Time Series Analysis"], ["Using an algorithm to recognise faces", "Machine Learning"],
      ] },
    ],
  }),
  A({
    chapter: 4,
    mcq: [
      ["Copying text from a website without credit is:", ["Hacking", "Plagiarism", "Spamming", "Phishing"], 1],
      ["You get a message: \"Win a free phone! Share your password.\" You should:", ["Send it", "Inform your parents", "Post online", "Give fake info"], 1],
      ["A pop-up says: \"Scan viruses, win $1000!\" The safest action is:", ["Click", "Ignore", "Ask someone else", "Download scanner"], 1],
      ["Checking your bank account on public Wi-Fi. Best action:", ["Check now", "Use secure network", "Ask someone else", "Install random app"], 1],
      ["Posting helpful tips online while thinking about who sees them is:", ["Active footprint", "Passive footprint", "Hacker footprint", "Phishing footprint"], 0],
    ],
    fill: [
      ["Responsible use of technology means thinking before you _____ online.", ["click"]],
      ["Never give out your _____ information to strangers online.", ["personal"]],
      ["Ethics in technology help prevent _____, plagiarism, and hacking.", ["cybercrimes", "cybercrime"]],
      ["A phishing attempt is an illegal attempt to obtain _____ information.", ["confidential", "personal"]],
      ["Active digital footprints are created when you _____ online intentionally.", ["post"]],
    ],
    short: [
      ["Define responsible digital citizenship and give one example from daily life.", "Responsible digital citizenship means using the internet safely and respectfully. Example: not sharing personal information online."],
      ["Name two ways to protect your privacy online and explain one.", "Use strong passwords; do not share personal information. Strong passwords stop others from getting into your accounts."],
      ["What is the difference between active and passive digital footprints?", "Active footprint: intentional activity. Passive footprint: unintentional activity."],
      ["Why is it important to use strong passwords and change them periodically?", "Strong passwords prevent hacking and protect accounts."],
      ["Explain software piracy and one step to prevent it.", "Software piracy is the illegal copying of software. Prevention: download software only from official websites."],
    ],
    apply: [
      ["A student posts a picture of a school project online. Which type of digital footprint is this?", "Active digital footprint"],
      ["Your friend receives an email asking for their bank details. What should they do?", "Ignore it and inform their parents."],
      ["A social media app recommends content based on your likes. How is your data being used?", "Your data is used for recommendations."],
      ["You want to download a new game safely. What steps will you follow to avoid malware?", "Download it from the official website and scan it with antivirus software."],
      ["You see someone copying your school assignment without permission. Which ethical rule is being broken?", "Honesty, or respect for other people's work."],
    ],
    tables: [
      { title: "Identify the term", choices: ["Phishing", "Plagiarism", "Digital footprint", "Computer ethics", "Privacy policy"], rows: [
        ["The act of sending fake emails or messages with the intention of stealing personal information.", "Phishing"],
        ["The act of copying someone else's work, text, or project without giving due credit.", "Plagiarism"],
        ["The record of all your online activities, including posts, likes, and websites visited.", "Digital footprint"],
        ["The rules and morals that should be followed while using computers and the internet to avoid causing harm.", "Computer ethics"],
        ["A document that explains how a website or app collects, uses, and protects users' personal data.", "Privacy policy"],
      ] },
    ],
  }),
];
