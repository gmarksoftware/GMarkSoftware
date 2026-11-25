import { adminContent } from './adminContent.js';

/**
 * All website text, from "GramGuru_Foundation_Website_Content.docx".
 *  - English + Marathi text is copied from the document.
 *  - Labels the document does not translate (buttons, form labels, nav, and the Marathi
 *    text for Donation / Gallery / Get Involved / Contact) were translated for this site –
 *    please have a Marathi speaker review the entries marked  // TRANSLATED.
 * Missing Marathi keys automatically fall back to English.
 */
export const content = {
  en: {
    admin: adminContent.en,
    meta: {
      title: 'Gram Guru Foundation | From Rural Development to Social Development',
      desc: 'Gram Guru Foundation is a social organization established in 2026, empowering individuals and communities through knowledge, skills, entrepreneurship and social initiatives.',
    },
    brand: { sub: 'ग्राम गुरु फाउंडेशन' },
    nav: {
      home: 'Home', about: 'About Us', aboutUs: 'About Gram Guru', vision: 'Vision & Mission', objectives: 'Our Objectives',
      programs: 'Our Courses', allCourses: 'All Free Courses', coursePlaylists: 'Course Video Playlists', btw: 'Business Transformation Workshop', edu: 'Education & Skill Development',
      youth: 'Youth Development', social: 'Social & Community Development', impact: 'Our Impact',
      gallery: 'Gallery', involved: 'Get Involved', contact: 'Contact', faq: 'FAQ', donate: 'Donate', language: 'Language',
      login: 'Login', register: 'Register', logout: 'Logout', adminPanel: 'Admin Panel',
    },
    common: {
      learnMore: 'Learn More', loading: 'Loading…', send: 'Send', sending: 'Sending…',
      thanks: 'Thank you! We have received your submission.', error: 'Something went wrong. Please try again.',
      approach: 'Our Approach', keyAreas: 'Key Areas', focusAreas: 'Focus Areas', topics: 'Workshop Topics',
    },
    tagline: 'From Rural Development to Social Development…',
    taglines: ['Knowledge • Skills • Entrepreneurship • Social Transformation', 'From Ideas to Action, From Action to Transformation'],
    home: {
      overline: 'Established in 2026',
      title: 'From Rural Development to Social Development…',
      subtitle: 'Creating a path toward a stronger and self-reliant society through knowledge, skills, entrepreneurship, and social initiatives.',
      intro: [
        'Gram Guru Foundation is a social organization established in 2026 with the aim of empowering individuals and communities by providing knowledge, skills, guidance, and opportunities for growth.',
        'We work towards creating positive change at the grassroots level through entrepreneurship development, education, skill development, youth empowerment, and social and community development initiatives.',
      ],
      ctaAbout: 'Learn More About Us', ctaInvolved: 'Get Involved',
      quote: 'Empowering one individual is the beginning of empowering a family, and empowering a community is the path toward social development.',
    },
    focus: {
      title: 'Our Areas of Focus',
      intro: 'Gram Guru Foundation works across various areas with the objective of creating meaningful and sustainable development in society.',
      items: [
        { title: 'Entrepreneurship Development', desc: 'We provide aspiring and new entrepreneurs with the knowledge, guidance, and practical understanding required to start and manage their businesses effectively.' },
        { title: 'Business Guidance', desc: 'We provide guidance on business planning, financial management, expense management, customer management, and business growth.' },
        { title: 'Education & Skill Development', desc: 'We conduct initiatives and guidance programs that help students and young people develop practical knowledge and essential skills for their personal and professional growth.' },
        { title: 'Youth Development', desc: 'We work towards developing confidence, leadership qualities, skills, and a positive mindset among young people.' },
        { title: 'Social Development', desc: 'We undertake initiatives focused on social awareness and development by understanding the needs and challenges of different sections of society.' },
        { title: 'Community Development', desc: 'We encourage local communities to come together and create opportunities for development through collective participation and collaboration.' },
      ],
    },
    about: {
      title: 'About Gram Guru Foundation',
      paras: [
        'Gram Guru Foundation is a social organization established in 2026 with the objective of empowering individuals and communities by providing knowledge, skills, guidance, and opportunities for development.',
        'At the rural and local level, many individuals have the potential, ideas, and desire to move forward. However, the lack of proper guidance, information, skills, and opportunities can often become a barrier to their progress.',
        'Understanding this need, Gram Guru Foundation works towards creating positive change through various social, educational, skill development, and entrepreneurship-focused initiatives.',
      ],
      believe: 'We believe that:',
      belief: 'Empowering one individual is the beginning of empowering a family, and empowering a community is the path toward social development.',
      founderLabel: 'Leadership', founderName: 'Mr. Gurudas Maruthi Bhikle', founderRole: 'Founder – Gram Guru Foundation',
      ceoName: 'Mr. Gajanan Mane', ceoRole: 'Chief Executive Officer',
      founderQuote: 'The development of society does not happen only through facilities; when individuals receive knowledge, skills, opportunities, and proper guidance, they can create their own path toward progress.',
      founderPara: 'Gram Guru Foundation was established in 2026 under the initiative of Mr. Gurudas Maruthi Bhikle, with the objective of making a positive contribution to society and creating opportunities for individual and community development.',
      ceoQuote: 'Through strategic planning, dedicated execution, and community participation, we strive to build sustainable pathways for rural youth and aspiring entrepreneurs.',
      ceoPara: 'Serving as the Chief Executive Officer of Gram Guru Foundation, Mr. Gajanan Mane leads executive initiatives, operational governance, and grassroots outreach to turn our shared vision into impactful social transformation.',
      viewProfile: 'View Profile',
      stats: {
        youthEmpowered: 'Youth Empowered',
        skillWorkshops: 'Skill Workshops',
        villagesReached: 'Villages Reached',
        ventures: 'Self-Reliant Ventures',
      },
    },
    vision: {
      title: 'Our Vision & Mission', visionTitle: 'Our Vision',
      vision: 'To build empowered entrepreneurs, self-reliant communities, and a developed society.',
      visionText: 'Our vision is to create opportunities for individuals to develop their capabilities through knowledge, skills, entrepreneurship, and social participation, thereby contributing to the creation of an empowered and self-reliant society.',
      missionTitle: 'Our Mission',
      mission: [
        'To develop an entrepreneurial mindset among youth and the new generation.',
        'To provide business guidance to new and aspiring entrepreneurs.',
        'To conduct various initiatives for skill development.',
        'To bridge the gap between education and practical knowledge.',
        'To promote social awareness and community participation.',
        'To work towards creating development opportunities at the local level.',
      ],
    },
    objectives: {
      title: 'Our Objectives',
      items: [
        { title: 'Promoting Knowledge', desc: 'To provide useful and practical knowledge to different sections of society.' },
        { title: 'Promoting Entrepreneurship', desc: 'To encourage and guide youth and aspiring individuals to explore entrepreneurship and start their own businesses.' },
        { title: 'Skill Development', desc: 'To conduct initiatives that help individuals develop skills required for employment, business, and personal growth.' },
        { title: 'Youth Empowerment', desc: 'To create opportunities that help young people develop confidence, leadership qualities, and a positive mindset.' },
        { title: 'Social Awareness', desc: 'To create awareness about important social issues and encourage responsible participation.' },
        { title: 'Community Participation', desc: 'To encourage individuals and communities to actively participate in the development process.' },
        { title: 'Promoting Self-Reliance', desc: 'To encourage individuals and communities to progress by utilizing their own capabilities, knowledge, and potential.' },
      ],
    },
    courses: {
      title: 'Our Courses',
      tagline: 'Free courses in entrepreneurship, business, digital and life skills – learn at your own pace.',
      catalogTitle: 'All Free Courses',
      intro: ['Every course on Gram Guru Foundation is completely free. Watch the video lessons anytime, on any device, and track your progress as you learn.'],
      all: 'All', none: 'No courses in this category yet.',
      free: 'Free', freeForAll: '100% Free', lessons: 'lessons',
      badge: { trending: 'Trending', bestseller: 'Most Popular' },
      trendingTitle: 'Trending Courses',
      trendingIntro: 'Start learning with the courses our community is joining the most – all free.',
      viewAll: 'View All Courses',
      videoSoon: 'Video for this lesson is coming soon.',
      prev: 'Previous', completeNext: 'Complete & Next', complete: 'Complete Course',
      youWillLearn: "What you'll learn", content: 'Course content', completed: 'completed', more: 'More free courses for you',
      playlists: 'Video Playlists', nowPlaying: 'Now Playing', nextVideo: 'Next Video', prevVideo: 'Previous Video', watchPlaylist: 'Watch Playlist', backToCourse: 'Back to Course Lesson',
    },
    programs: {
      title: 'Our Initiatives / Programs',
      intro: [
        'Gram Guru Foundation undertakes initiatives based on local needs and circumstances, with a focus on knowledge, entrepreneurship, skill development, youth empowerment, and social participation.',
        'Our programs are designed to provide practical guidance, create awareness, develop skills, and encourage individuals to take positive steps toward personal and community development.',
      ],
    },
    btw: {
      title: 'Business Transformation Workshop', tagline: 'From Ideas to Business Growth…',
      summary: [
        'The Business Transformation Workshop is an initiative designed to provide the new generation of entrepreneurs with practical guidance related to starting, planning, managing, and growing a business.',
        'The workshops cover important areas such as business planning, financial planning, expense management, business management, and entrepreneurial thinking.',
      ],
      keyAreas: ['Business Planning', 'Financial Management', 'Expense Management', 'Entrepreneurial Mindset', 'Business Growth', 'Practical Business Guidance'],
      about: 'About the Workshop',
      intro: 'Individuals who want to start a business often have several questions:',
      questions: ['How do I start a business?', 'How should I plan my business?', 'How can I manage expenses?', 'How should I manage finances?', 'What is required to grow a business?'],
      outro: 'The Business Transformation Workshop by Gram Guru Foundation is designed to address these questions through practical guidance and entrepreneurial learning.',
      topics: ['Preparing to Start a Business', 'Business Planning', 'Entrepreneurial Mindset', 'Financial Planning', 'Expense Management', 'Business Management', 'Business Growth Planning', 'Practical Business Guidance'],
      goalTitle: 'Workshop Goal',
      goal: 'To provide new entrepreneurs with the right information, proper direction, and a practical approach toward understanding and managing a business.',
      upcoming: 'Upcoming Programs',
      noUpcoming: 'No upcoming programs have been announced yet. You can still register your interest below and we will contact you.',
      registerTitle: 'Register Your Interest',
      registerLead: 'Fill in your details and the Foundation will get back to you with program information.',
      register: 'Register', registrationOpen: 'Registration open', registrationClosed: 'Registration closed',
    },
    edu: {
      title: 'Education & Skill Development',
      paras: [
        'Education is an important foundation for individual development. However, in a rapidly changing world, practical skills are equally important.',
        'Gram Guru Foundation encourages students, youth, and community members to develop useful knowledge and practical skills through various initiatives and guidance programs.',
      ],
      approach: ['Learn', 'Develop Skills', 'Apply', 'Grow'],
      focus: ['Practical Learning', 'Communication Skills', 'Digital Awareness', 'Career Awareness', 'Entrepreneurship Skills', 'Personal Development'],
    },
    youth: {
      title: 'Youth Empowerment',
      paras: [
        'Youth are an important force for the future of society.',
        'With the right direction, knowledge, skills, and opportunities, young people can contribute not only to their own development but also to the development of their communities and society.',
      ],
      lead: 'Gram Guru Foundation encourages youth development in areas such as:',
      list: ['Self-Confidence', 'Leadership Skills', 'Entrepreneurship', 'Skill Development', 'Positive Thinking', 'Social Responsibility'],
      outro: 'Through various initiatives, we aim to provide young people with opportunities to learn, develop, participate, and grow.',
    },
    social: {
      title: 'Social & Community Development',
      paras: [
        'The development of society cannot be achieved through the progress of one individual alone. Long-term social transformation requires collective participation, collaboration, and shared responsibility.',
        'Gram Guru Foundation works towards understanding local community needs and undertaking initiatives focused on social awareness, participation, empowerment, and development.',
      ],
      approach: ['Identify', 'Engage', 'Educate', 'Empower', 'Transform'],
    },
    impact: {
      title: 'Our Impact / Achievements',
      intro: [
        'Through our initiatives, we strive to make knowledge, guidance, and development opportunities accessible to more individuals and communities.',
        'Our focus is on creating meaningful participation, developing skills, encouraging entrepreneurship, and contributing to positive social change.',
      ],
      stats: { foundedYear: 'Foundation Started', workshops: 'Workshops & Programs', participants: 'Participants', beneficiaries: 'Beneficiaries', communityInitiatives: 'Community Initiatives', youthReached: 'Entrepreneurs / Youth Reached' },
      measureTitle: 'What we measure',
      measure: ['Number of workshops conducted', 'Number of participants', 'Number of beneficiaries', 'Number of community initiatives', 'Number of entrepreneurship programs', 'Number of youth reached', 'Number of training and awareness sessions'],
    },
    donate: {
      title: 'Support Our Mission', tagline: 'Your Support Can Help Create Opportunities for Change.',
      paras: [
        'Gram Guru Foundation works towards empowering individuals and communities through knowledge, skills, entrepreneurship, education, and social development initiatives.',
        'Your support can help us reach more individuals, conduct meaningful programs, and create greater opportunities for learning, development, and empowerment.',
      ],
      whyTitle: 'Why Support Us?', whyLead: 'Your contribution can support initiatives related to:',
      why: ['Entrepreneurship Development', 'Education & Skill Development', 'Youth Empowerment', 'Social Awareness', 'Community Development', 'Training & Workshops'],
      cta: 'Donate Now', formTitle: 'Tell us you want to donate',
      formLead: 'Leave your details and the Foundation will contact you with the official donation details. No payment is taken on this website.',
      amount: 'Amount you would like to give (₹)', payTitle: 'Official donation details',
      payPending: 'Official donation details will be published here once they have been verified by Gram Guru Foundation.',
      payNow: 'Pay online', upi: 'UPI ID', accountName: 'Account name', bankName: 'Bank', accountNumber: 'Account number', ifsc: 'IFSC',
      registrationDetails: 'Registration details', taxInformation: 'Tax information',
    },
    gallery: {
      title: 'Our Gallery', tagline: 'A Glimpse of Our Journey',
      intro: 'Explore moments from our workshops, programs, events, community initiatives, and various activities.',
      all: 'All', empty: 'Photos will appear here soon.', imageUnavailable: 'Image unavailable.',
      categories: { workshops: 'Workshops', training: 'Training Programs', social: 'Social Activities', community: 'Community Programs', awareness: 'Awareness Programs', events: 'Events', entrepreneurship: 'Entrepreneurship Programs', education: 'Education & Skill Programs' },
    },
    involved: {
      title: 'Be a Part of the Change',
      paras: [
        'Positive social change becomes stronger when people come together.',
        'If you have time, skills, experience, ideas, or simply the desire to contribute to society, you can become a part of the Gram Guru Foundation journey.',
      ],
      waysTitle: 'Ways to Get Involved',
      ways: [
        { key: 'volunteer', title: 'Volunteer', desc: 'Contribute your time, skills, and knowledge to support our initiatives.' },
        { key: 'partner', title: 'Partner With Us', desc: 'Collaborate with us to develop meaningful programs and create greater community impact.' },
        { key: 'support', title: 'Support Our Initiatives', desc: 'Support our programs and initiatives through appropriate contributions and resources.' },
        { key: 'participate', title: 'Participate', desc: 'Participate in our workshops, events, awareness programs, and community activities.' },
      ],
      cta: 'Join the Movement', formTitle: 'Become a Volunteer', interest: 'I would like to', submit: 'Become a Volunteer',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'What is Gram Guru Foundation?', a: 'Gram Guru Foundation is a social organization established in 2026, working towards positive social change through knowledge, skills, entrepreneurship, education, and community development.' },
        { q: 'Who can participate in your programs?', a: 'Depending on the nature of the program, students, youth, entrepreneurs, aspiring entrepreneurs, individuals, and members of the community can participate.' },
        { q: 'What is the Business Transformation Workshop?', a: 'It is an entrepreneurship and business guidance workshop covering topics such as business planning, financial management, expense management, business management, and business growth.' },
        { q: 'How can I participate?', a: 'You can check our Events and Updates section for information about upcoming programs and registration details.' },
        { q: 'Can I volunteer?', a: "Yes. Individuals interested in supporting Gram Guru Foundation's initiatives can contact us to explore volunteer opportunities." },
        { q: 'How can I support Gram Guru Foundation?', a: 'You can contribute by volunteering, partnering with us, participating in our programs, supporting our initiatives, or making an appropriate donation.' },
      ],
    },
    contact: {
      title: 'Contact Us', tagline: 'Let’s Connect, Collaborate, and Create a Better Future Together.',
      intro: 'For information regarding our programs, workshops, volunteering opportunities, collaborations, or other initiatives, please get in touch with Gram Guru Foundation.',
      infoTitle: 'Contact Information', office: 'Office', founder: 'Founder', phone: 'Phone', email: 'Email', address: 'Address', formTitle: 'Contact Form',
      send: 'Send Message',
    },
    form: { fullName: 'Full Name', mobile: 'Mobile Number', email: 'Email Address', subject: 'Subject', message: 'Message', place: 'Village / City', optional: 'optional', yourEmail: 'Enter your email' },
    footer: {
      quick: 'Quick Links', initiatives: 'Our Initiatives', newsTitle: 'Stay Updated',
      newsDesc: 'Subscribe to hear about upcoming programs and updates from Gram Guru Foundation.', newsBtn: 'Subscribe',
      subscribed: 'Thank you for subscribing!', already: 'You are already subscribed.', rights: 'All rights reserved.',
    },
  },

  mr: {
    admin: adminContent.mr,
    meta: {
      title: 'Gram Guru Foundation | ग्रामविकासातून समाजविकासाकडे',
      desc: 'Gram Guru Foundation ही 2026 मध्ये सुरू झालेली सामाजिक संस्था असून ज्ञान, कौशल्य, उद्योजकता आणि सामाजिक विकासाच्या माध्यमातून सकारात्मक परिवर्तन घडविण्यासाठी कार्य करते.',
    },
    nav: { // TRANSLATED (the document lists the menu in English only)
      home: 'मुख्यपृष्ठ', about: 'आमच्याविषयी', aboutUs: 'Gram Guru विषयी', vision: 'दृष्टी व ध्येय', objectives: 'आमची उद्दिष्टे',
      programs: 'आमचे कोर्सेस', allCourses: 'सर्व मोफत कोर्सेस', coursePlaylists: 'कोर्स व्हिडिओ प्लेलिस्ट्स', btw: 'Business Transformation Workshop', edu: 'शिक्षण व कौशल्य विकास',
      youth: 'युवा सक्षमीकरण', social: 'सामाजिक व समुदाय विकास', impact: 'आमचा प्रभाव',
      gallery: 'गॅलरी', involved: 'सहभागी व्हा', contact: 'संपर्क', faq: 'सतत विचारले जाणारे प्रश्न', donate: 'देणगी', language: 'भाषा',
      login: 'लॉगिन', register: 'नोंदणी', logout: 'लॉगआउट', adminPanel: 'अ‍ॅडमिन पॅनेल', // TRANSLATED
    },
    common: { // TRANSLATED
      learnMore: 'अधिक जाणून घ्या', loading: 'लोड होत आहे…', send: 'पाठवा', sending: 'पाठवत आहे…',
      thanks: 'धन्यवाद! तुमची माहिती आम्हाला मिळाली आहे.', error: 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',
      approach: 'आमचा दृष्टिकोन', keyAreas: 'प्रमुख क्षेत्रे', focusAreas: 'कार्यक्षेत्रे', topics: 'कार्यशाळेतील विषय',
    },
    tagline: 'ग्रामविकासातून समाजविकासाकडे…',
    taglines: ['ज्ञान • कौशल्य • उद्योजकता • सामाजिक परिवर्तन', 'विचारातून कृतीकडे, कृतीतून परिवर्तनाकडे'],
    home: {
      overline: '2026 मध्ये स्थापना', // TRANSLATED
      title: 'ग्रामविकासातून समाजविकासाकडे…',
      subtitle: 'ज्ञान, कौशल्य, उद्योजकता आणि सामाजिक उपक्रमांच्या माध्यमातून अधिक सक्षम आणि स्वावलंबी समाजाकडे वाटचाल.', // TRANSLATED
      intro: [
        'Gram Guru Foundation ही 2026 मध्ये सुरू झालेली सामाजिक संस्था आहे. समाजातील व्यक्ती आणि समुदायांना ज्ञान, कौशल्य, मार्गदर्शन आणि विकासाच्या संधी उपलब्ध करून देत त्यांना अधिक सक्षम बनविण्याच्या उद्देशाने Foundation कार्य करते.',
        'उद्योजकता विकास, शिक्षण, कौशल्य विकास, युवा सक्षमीकरण तसेच सामाजिक व समुदाय विकासाच्या उपक्रमांतून आम्ही तळागाळात सकारात्मक बदल घडविण्यासाठी कार्य करतो.', // TRANSLATED
      ],
      ctaAbout: 'आमच्याविषयी अधिक जाणून घ्या', ctaInvolved: 'सहभागी व्हा',
      quote: 'एका व्यक्तीला सक्षम करणे म्हणजे एका कुटुंबाला सक्षम करण्याची सुरुवात आणि एका समुदायाला सक्षम करण्याची दिशा.',
    },
    focus: {
      title: 'आमचे कार्यक्षेत्र',
      intro: 'समाजात अर्थपूर्ण आणि शाश्वत विकास घडविण्याच्या उद्देशाने Gram Guru Foundation विविध क्षेत्रांत कार्य करते.', // TRANSLATED
      items: [
        { title: 'उद्योजकता विकास', desc: 'नवीन उद्योजकांना व्यवसाय सुरू करण्यासाठी आणि व्यवसाय अधिक प्रभावीपणे चालविण्यासाठी आवश्यक मार्गदर्शन, ज्ञान आणि व्यावहारिक समज उपलब्ध करून देणे.' },
        { title: 'व्यवसाय मार्गदर्शन', desc: 'व्यवसायातील नियोजन, आर्थिक व्यवस्थापन, खर्च नियंत्रण, ग्राहक व्यवस्थापन आणि व्यवसायवृद्धी यांसारख्या विषयांवर मार्गदर्शन.' },
        { title: 'शिक्षण व कौशल्य विकास', desc: 'युवा आणि विद्यार्थ्यांना ज्ञानासोबतच आवश्यक कौशल्ये विकसित करण्यासाठी विविध उपक्रम आणि मार्गदर्शन कार्यक्रम राबविणे.' },
        { title: 'युवा सक्षमीकरण', desc: 'युवांमध्ये आत्मविश्वास, नेतृत्वगुण, कौशल्ये आणि सकारात्मक दृष्टिकोन विकसित करण्यासाठी विविध उपक्रम.' },
        { title: 'सामाजिक विकास', desc: 'समाजातील विविध गरजा आणि आव्हाने लक्षात घेऊन सामाजिक जागृती आणि विकासासाठी उपक्रम राबविणे.' },
        { title: 'समुदाय विकास', desc: 'स्थानिक समुदायाला एकत्र आणून सामूहिक सहभागातून विकासाच्या संधी निर्माण करण्याचा प्रयत्न.' },
      ],
    },
    about: {
      title: 'Gram Guru Foundation विषयी',
      paras: [
        'Gram Guru Foundation ही 2026 मध्ये सुरू झालेली सामाजिक संस्था आहे. समाजातील व्यक्ती आणि समुदायांना ज्ञान, कौशल्य, मार्गदर्शन आणि विकासाच्या संधी उपलब्ध करून देत त्यांना अधिक सक्षम बनविण्याच्या उद्देशाने Foundation कार्य करते.',
        'ग्रामीण आणि स्थानिक पातळीवर अनेक व्यक्तींमध्ये क्षमता, कल्पना आणि पुढे जाण्याची इच्छा असते. मात्र योग्य मार्गदर्शन, माहिती, कौशल्य आणि संधींचा अभाव अनेकदा त्यांच्या प्रगतीसमोर अडथळा ठरतो.',
        'हीच गरज लक्षात घेऊन Gram Guru Foundation विविध सामाजिक, शैक्षणिक, कौशल्यविकास आणि उद्योजकता-केंद्रित उपक्रमांच्या माध्यमातून सकारात्मक परिवर्तन घडविण्याचा प्रयत्न करते.',
      ],
      believe: 'आमचा विश्वास आहे की',
      belief: 'एका व्यक्तीला सक्षम करणे म्हणजे एका कुटुंबाला सक्षम करण्याची सुरुवात आणि एका समुदायाला सक्षम करण्याची दिशा.',
      founderLabel: 'नेतृत्व', founderName: 'श्री. गुरुदास मारुती भिकले', founderRole: 'संस्थापक – Gram Guru Foundation',
      ceoName: 'श्री. गजानन माने', ceoRole: 'मुख्य कार्यकारी अधिकारी',
      founderQuote: 'समाजाचा विकास केवळ सुविधांमुळे होत नाही; ज्ञान, कौशल्य, संधी आणि योग्य मार्गदर्शन मिळाल्यावर व्यक्ती स्वतःच्या प्रगतीची दिशा निर्माण करू शकते.',
      founderPara: 'Gram Guru Foundation ची स्थापना समाजाच्या विकासासाठी सकारात्मक योगदान देण्याच्या उद्देशाने श्री. गुरुदास मारुती भिकले यांच्या पुढाकारातून 2026 मध्ये करण्यात आली.',
      ceoQuote: 'धोरणात्मक नियोजन, समर्पित अंमलबजावणी आणि लोकसहभागाच्या माध्यमातून आम्ही ग्रामीण युवा आणि नवउद्योजकांसाठी शाश्वत प्रगतीचे मार्ग निर्माण करत आहोत.',
      ceoPara: 'Gram Guru Foundation चे मुख्य कार्यकारी अधिकारी म्हणून श्री. गजानन माने संस्थेचे धोरणात्मक कामकाज, अंमलबजावणी आणि ग्रामीण पातळीवरील उपक्रमांचे यशस्वी नेतृत्व करत आहेत.',
      viewProfile: 'प्रोफाइल पहा',
      stats: {
        youthEmpowered: 'सक्षम युवा',
        skillWorkshops: 'कौशल्य कार्यशाळा',
        villagesReached: 'पोहोचलेली गावे',
        ventures: 'स्वावलंबी उपक्रम',
      },
    },
    vision: {
      title: 'आमची दृष्टी व ध्येय', visionTitle: 'आमची दृष्टी',
      vision: 'सक्षम उद्योजक, स्वावलंबी समुदाय आणि विकसित समाज घडविणे.',
      visionText: 'ज्ञान, कौशल्य, उद्योजकता आणि सामाजिक सहभाग यांच्या माध्यमातून प्रत्येक व्यक्तीला स्वतःच्या क्षमतांचा विकास करण्याची संधी मिळावी आणि त्यातून सक्षम व स्वावलंबी समाजाची निर्मिती व्हावी, ही आमची दृष्टी आहे.',
      missionTitle: 'आमचे ध्येय',
      mission: [
        'युवा आणि नव्या पिढीमध्ये उद्योजकतेची भावना निर्माण करणे.',
        'नवीन उद्योजकांना व्यवसायविषयक मार्गदर्शन देणे.',
        'कौशल्य विकासासाठी विविध उपक्रम आयोजित करणे.',
        'शिक्षण आणि व्यावहारिक ज्ञान यांच्यातील अंतर कमी करण्याचा प्रयत्न करणे.',
        'सामाजिक जागृती आणि समुदाय सहभाग वाढविणे.',
        'स्थानिक स्तरावर विकासाच्या संधी निर्माण करण्यासाठी कार्य करणे.',
      ],
    },
    objectives: {
      title: 'आमची उद्दिष्टे',
      items: [
        { title: 'ज्ञानाचा प्रसार', desc: 'समाजातील विविध घटकांपर्यंत उपयुक्त आणि व्यावहारिक ज्ञान पोहोचविणे.' },
        { title: 'उद्योजकता वाढविणे', desc: 'युवा आणि इच्छुक व्यक्तींना व्यवसाय सुरू करण्यासाठी प्रोत्साहन व मार्गदर्शन देणे.' },
        { title: 'कौशल्य विकास', desc: 'रोजगार, व्यवसाय आणि वैयक्तिक विकासासाठी आवश्यक कौशल्ये विकसित करण्यासाठी उपक्रम राबविणे.' },
        { title: 'युवा सक्षमीकरण', desc: 'युवांमध्ये आत्मविश्वास, नेतृत्व आणि सकारात्मक विचारसरणी विकसित करण्यासाठी संधी उपलब्ध करून देणे.' },
        { title: 'सामाजिक जागृती', desc: 'महत्त्वाच्या सामाजिक विषयांबाबत जनजागृती निर्माण करणे.' },
        { title: 'समुदाय सहभाग', desc: 'समाजातील व्यक्तींना विकासाच्या प्रक्रियेत सहभागी करून घेणे.' },
        { title: 'स्वावलंबनाला प्रोत्साहन', desc: 'व्यक्ती आणि समुदायांना स्वतःच्या क्षमतांवर आधारित प्रगती करण्यासाठी प्रोत्साहित करणे.' },
      ],
    },
    courses: {
      title: 'आमचे कोर्सेस',
      tagline: 'उद्योजकता, व्यवसाय, डिजिटल व जीवन कौशल्यांचे मोफत कोर्सेस – तुमच्या गतीने शिका.',
      catalogTitle: 'सर्व मोफत कोर्सेस',
      intro: ['Gram Guru Foundation वरील प्रत्येक कोर्स पूर्णपणे मोफत आहे. कधीही, कोणत्याही डिव्हाइसवर व्हिडिओ पाठ पहा आणि तुमची प्रगती तपासा.'],
      all: 'सर्व', none: 'या श्रेणीत अजून कोर्सेस नाहीत.',
      free: 'मोफत', freeForAll: '१००% मोफत', lessons: 'पाठ',
      badge: { trending: 'ट्रेंडिंग', bestseller: 'सर्वाधिक लोकप्रिय' },
      trendingTitle: 'ट्रेंडिंग कोर्सेस',
      trendingIntro: 'आमचा समुदाय सर्वाधिक निवडत असलेल्या कोर्सेसपासून शिकायला सुरुवात करा – सर्व मोफत.',
      viewAll: 'सर्व कोर्सेस पहा',
      videoSoon: 'या पाठाचा व्हिडिओ लवकरच उपलब्ध होईल.',
      prev: 'मागील', completeNext: 'पूर्ण करा व पुढे', complete: 'कोर्स पूर्ण करा',
      youWillLearn: 'तुम्ही काय शिकाल', content: 'कोर्सची सामग्री', completed: 'पूर्ण', more: 'तुमच्यासाठी आणखी मोफत कोर्सेस',
      playlists: 'व्हिडिओ प्लेलिस्ट', nowPlaying: 'सध्या सुरू असलेला', nextVideo: 'पुढील व्हिडिओ', prevVideo: 'मागील व्हिडिओ', watchPlaylist: 'प्लेलिस्ट पहा', backToCourse: 'कोर्स पाठाकडे परत',
    },
    programs: {
      title: 'आमचे उपक्रम',
      intro: ['Gram Guru Foundation विविध गरजा आणि स्थानिक परिस्थिती लक्षात घेऊन ज्ञान, उद्योजकता, कौशल्य विकास आणि सामाजिक सहभागावर आधारित उपक्रम राबविते.'],
    },
    btw: {
      title: 'Business Transformation Workshop', tagline: 'कल्पनेपासून व्यवसायाच्या विकासापर्यंत…',
      summary: [
        'नवीन पिढीतील उद्योजकांना व्यवसाय सुरू करण्यापासून व्यवसायाचे नियोजन, व्यवस्थापन आणि विकासापर्यंत आवश्यक मार्गदर्शन मिळावे, या उद्देशाने Business Transformation Workshop ही उपक्रममालिका आयोजित केली जाते.',
        'या कार्यशाळांमध्ये व्यवसायाची सुरुवात, आर्थिक नियोजन, खर्चाचे व्यवस्थापन, व्यवसायातील नियोजन आणि उद्योजकीय विचारसरणी यांसारख्या विषयांवर मार्गदर्शन केले जाते.',
      ],
      keyAreas: ['व्यवसाय नियोजन', 'आर्थिक व्यवस्थापन', 'खर्च व्यवस्थापन', 'उद्योजकीय मानसिकता', 'व्यवसाय वाढ', 'व्यावहारिक व्यवसाय मार्गदर्शन'],
      about: 'कार्यशाळेविषयी', // TRANSLATED
      intro: 'व्यवसाय सुरू करण्याची इच्छा असलेल्या व्यक्तींना अनेक प्रश्न पडतात —',
      questions: ['व्यवसाय कसा सुरू करायचा?', 'योग्य नियोजन कसे करायचे?', 'खर्च कसा नियंत्रित करायचा?', 'आर्थिक व्यवस्थापन कसे करायचे?', 'व्यवसाय वाढविण्यासाठी कोणत्या गोष्टी आवश्यक आहेत?'],
      outro: 'याच प्रश्नांना व्यावहारिक पद्धतीने समजून घेण्यासाठी Gram Guru Foundation तर्फे Business Transformation Workshop आयोजित केली जाते.',
      topics: ['व्यवसाय सुरू करण्याची तयारी', 'व्यवसाय नियोजन', 'उद्योजकीय मानसिकता', 'आर्थिक नियोजन', 'खर्च व्यवस्थापन', 'व्यवसाय व्यवस्थापन', 'व्यवसाय वाढीचे नियोजन', 'व्यावहारिक मार्गदर्शन'],
      goalTitle: 'कार्यशाळेचे ध्येय',
      goal: 'नवीन उद्योजकांना योग्य माहिती, योग्य दिशा आणि व्यवसायाकडे पाहण्याचा व्यावहारिक दृष्टिकोन देणे.',
      upcoming: 'आगामी कार्यक्रम', // TRANSLATED (this and the following entries up to `register…`)
      noUpcoming: 'अद्याप कोणतेही आगामी कार्यक्रम जाहीर झालेले नाहीत. तरीही तुम्ही खाली तुमची आवड नोंदवू शकता, आम्ही तुमच्याशी संपर्क साधू.',
      registerTitle: 'तुमची आवड नोंदवा',
      registerLead: 'तुमची माहिती भरा; Foundation कार्यक्रमाच्या माहितीसह तुमच्याशी संपर्क साधेल.',
      register: 'नोंदणी करा', registrationOpen: 'नोंदणी सुरू', registrationClosed: 'नोंदणी बंद',
    },
    edu: {
      title: 'शिक्षण आणि कौशल्य विकास',
      paras: [
        'शिक्षण हे व्यक्तीच्या विकासाचे महत्त्वाचे साधन आहे. मात्र बदलत्या काळानुसार ज्ञानासोबत व्यावहारिक कौशल्येही आवश्यक आहेत.',
        'Gram Guru Foundation विविध उपक्रमांच्या माध्यमातून विद्यार्थी, युवा आणि समुदायातील व्यक्तींना उपयुक्त ज्ञान व कौशल्ये आत्मसात करण्यासाठी प्रोत्साहित करते.',
      ],
      approach: ['शिका', 'कौशल्ये विकसित करा', 'अंमलबजावणी करा', 'प्रगती करा'],
      focus: ['व्यावहारिक शिक्षण', 'संवाद कौशल्ये', 'डिजिटल साक्षरता', 'करिअर जागरूकता', 'उद्योजकता कौशल्ये', 'व्यक्तिमत्त्व विकास'],
    },
    youth: {
      title: 'युवा सक्षमीकरण',
      paras: [
        'युवा ही समाजाच्या भविष्यातील महत्त्वाची शक्ती आहे.',
        'युवांना योग्य दिशा, ज्ञान, कौशल्य आणि संधी मिळाल्यास ते स्वतःच्या विकासासोबतच समाजाच्या विकासातही महत्त्वाची भूमिका बजावू शकतात.',
      ],
      lead: 'Foundation युवांमध्ये:',
      list: ['आत्मविश्वास', 'नेतृत्वगुण', 'उद्योजकता', 'कौशल्य विकास', 'सकारात्मक विचार', 'सामाजिक जबाबदारी'],
      outro: 'यांना प्रोत्साहन देण्यासाठी विविध उपक्रम राबविण्याचा प्रयत्न करते.',
    },
    social: {
      title: 'सामाजिक व समुदाय विकास',
      paras: [
        'समाजातील विकास हा केवळ एका व्यक्तीच्या प्रगतीने पूर्ण होत नाही. सामूहिक सहभाग आणि सहकार्याच्या माध्यमातूनच दीर्घकालीन सामाजिक परिवर्तन घडू शकते.',
        'Gram Guru Foundation स्थानिक समुदायातील गरजा लक्षात घेऊन सामाजिक जागृती, सहभाग आणि विकासासाठी विविध उपक्रम राबविण्याच्या दिशेने कार्य करते.',
      ],
      approach: ['ओळखा', 'सहभागी व्हा', 'शिक्षित करा', 'सक्षम करा', 'परिवर्तन घडवा'],
    },
    impact: {
      title: 'आमचा प्रभाव',
      intro: ['आमच्या उपक्रमांमधून ज्ञान, मार्गदर्शन आणि विकासाच्या संधी अधिकाधिक व्यक्तींपर्यंत पोहोचविण्याचा आमचा प्रयत्न आहे.'],
      stats: { foundedYear: 'संस्थेची सुरुवात', workshops: 'कार्यशाळा / कार्यक्रम', participants: 'सहभागी', beneficiaries: 'लाभार्थी', communityInitiatives: 'सामुदायिक उपक्रम', youthReached: 'उद्योजक / युवांपर्यंत पोहोच' },
      measureTitle: 'आम्ही काय मोजतो', // TRANSLATED
      measure: ['आयोजित कार्यशाळांची संख्या', 'सहभागींची संख्या', 'लाभार्थ्यांची संख्या', 'सामुदायिक उपक्रमांची संख्या', 'उद्योजकता कार्यक्रमांची संख्या', 'पोहोचलेल्या युवांची संख्या', 'प्रशिक्षण व जनजागृती सत्रांची संख्या'],
    },
    donate: { // TRANSLATED
      title: 'आमच्या कार्याला पाठबळ द्या', tagline: 'तुमचे सहकार्य बदलाच्या संधी निर्माण करण्यास मदत करू शकते.',
      paras: [
        'Gram Guru Foundation ज्ञान, कौशल्य, उद्योजकता, शिक्षण आणि सामाजिक विकासाच्या उपक्रमांतून व्यक्ती आणि समुदायांना सक्षम करण्यासाठी कार्य करते.',
        'तुमच्या सहकार्यामुळे आम्ही अधिकाधिक लोकांपर्यंत पोहोचू शकतो, अर्थपूर्ण कार्यक्रम राबवू शकतो आणि शिक्षण, विकास व सक्षमीकरणाच्या अधिक संधी निर्माण करू शकतो.',
      ],
      whyTitle: 'आम्हाला पाठबळ का द्यावे?', whyLead: 'तुमचे योगदान खालील उपक्रमांना पाठबळ देऊ शकते:',
      why: ['उद्योजकता विकास', 'शिक्षण व कौशल्य विकास', 'युवा सक्षमीकरण', 'सामाजिक जागृती', 'समुदाय विकास', 'प्रशिक्षण व कार्यशाळा'],
      cta: 'आता देणगी द्या', formTitle: 'देणगी देण्याची इच्छा कळवा',
      formLead: 'तुमची माहिती द्या; Foundation अधिकृत देणगी तपशीलांसह तुमच्याशी संपर्क साधेल. या वेबसाइटवर कोणतेही पेमेंट घेतले जात नाही.',
      amount: 'देऊ इच्छित रक्कम (₹)', payTitle: 'अधिकृत देणगी तपशील',
      payPending: 'Gram Guru Foundation कडून पडताळणी झाल्यानंतर अधिकृत देणगी तपशील येथे प्रसिद्ध केले जातील.',
      payNow: 'ऑनलाइन पेमेंट', upi: 'UPI आयडी', accountName: 'खात्याचे नाव', bankName: 'बँक', accountNumber: 'खाते क्रमांक', ifsc: 'IFSC',
      registrationDetails: 'नोंदणी तपशील', taxInformation: 'कर माहिती',
    },
    gallery: { // TRANSLATED
      title: 'आमची गॅलरी', tagline: 'आमच्या प्रवासाची झलक',
      intro: 'आमच्या कार्यशाळा, कार्यक्रम, उपक्रम आणि विविध कार्यांतील क्षण पहा.',
      all: 'सर्व', empty: 'फोटो लवकरच येथे दिसतील.', imageUnavailable: 'प्रतिमा अनुपलब्ध.',
      categories: { workshops: 'कार्यशाळा', training: 'प्रशिक्षण कार्यक्रम', social: 'सामाजिक उपक्रम', community: 'सामुदायिक कार्यक्रम', awareness: 'जनजागृती कार्यक्रम', events: 'कार्यक्रम', entrepreneurship: 'उद्योजकता कार्यक्रम', education: 'शिक्षण व कौशल्य कार्यक्रम' },
    },
    involved: { // TRANSLATED
      title: 'बदलाचा भाग व्हा',
      paras: [
        'लोक एकत्र आले की सकारात्मक सामाजिक बदल अधिक बळकट होतो.',
        'तुमच्याकडे वेळ, कौशल्य, अनुभव, कल्पना असतील किंवा समाजासाठी योगदान देण्याची इच्छा असेल, तर तुम्ही Gram Guru Foundation च्या प्रवासाचा भाग होऊ शकता.',
      ],
      waysTitle: 'सहभागी होण्याचे मार्ग',
      ways: [
        { key: 'volunteer', title: 'स्वयंसेवक व्हा', desc: 'आमच्या उपक्रमांना पाठबळ देण्यासाठी तुमचा वेळ, कौशल्य आणि ज्ञान द्या.' },
        { key: 'partner', title: 'आमच्यासोबत भागीदारी करा', desc: 'अर्थपूर्ण कार्यक्रम घडविण्यासाठी आणि समाजावर अधिक प्रभाव पाडण्यासाठी आमच्यासोबत सहकार्य करा.' },
        { key: 'support', title: 'आमच्या उपक्रमांना सहकार्य करा', desc: 'योग्य योगदान आणि संसाधनांच्या माध्यमातून आमच्या कार्यक्रमांना व उपक्रमांना पाठबळ द्या.' },
        { key: 'participate', title: 'सहभागी व्हा', desc: 'आमच्या कार्यशाळा, कार्यक्रम, जनजागृती उपक्रम आणि सामुदायिक कार्यांमध्ये सहभागी व्हा.' },
      ],
      cta: 'चळवळीत सामील व्हा', formTitle: 'स्वयंसेवक व्हा', interest: 'मला हवे आहे', submit: 'स्वयंसेवक व्हा',
    },
    faq: {
      title: 'सतत विचारले जाणारे प्रश्न', // TRANSLATED heading; Q&A below are from the document
      items: [
        { q: 'What is Gram Guru Foundation?', a: 'Gram Guru Foundation ही 2026 मध्ये सुरू झालेली सामाजिक संस्था असून ज्ञान, कौशल्य, उद्योजकता आणि सामाजिक विकासाच्या माध्यमातून सकारात्मक परिवर्तन घडविण्यासाठी कार्य करते.' },
        { q: 'Who can participate in your programs?', a: 'Foundation च्या संबंधित कार्यक्रमाच्या स्वरूपानुसार विद्यार्थी, युवा, उद्योजक, इच्छुक व्यक्ती आणि समुदायातील विविध घटक सहभागी होऊ शकतात.' },
        { q: 'What is Business Transformation Workshop?', a: 'ही उद्योजकता आणि व्यवसाय मार्गदर्शनावर आधारित कार्यशाळा असून व्यवसाय नियोजन, आर्थिक व्यवस्थापन, खर्च व्यवस्थापन आणि व्यवसायवृद्धी यांसारख्या विषयांवर मार्गदर्शन केले जाते.' },
        { q: 'How can I participate?', a: 'आमच्या Events आणि Updates section मधून संबंधित कार्यक्रमाची माहिती पाहून नोंदणी करता येईल.' },
        { q: 'Can I volunteer?', a: 'होय. Foundation च्या उपक्रमांसाठी volunteer म्हणून सहभागी होण्यासाठी आमच्याशी संपर्क साधता येईल.' },
        { q: 'How can I support Gram Guru Foundation?', a: 'तुम्ही volunteer म्हणून, partner म्हणून, कार्यक्रमांमध्ये सहभागी होऊन किंवा Foundation च्या उपक्रमांना योग्य पद्धतीने सहकार्य करून योगदान देऊ शकता.' },
      ],
    },
    contact: { // TRANSLATED
      title: 'आमच्याशी संपर्क साधा', tagline: 'चला जोडले जाऊया, सहकार्य करूया आणि एकत्र चांगले भविष्य घडवूया.',
      intro: 'आमचे कार्यक्रम, कार्यशाळा, स्वयंसेवक संधी, सहकार्य किंवा इतर उपक्रमांबद्दल माहितीसाठी कृपया Gram Guru Foundation शी संपर्क साधा.',
      infoTitle: 'संपर्क माहिती', office: 'कार्यालय', founder: 'संस्थापक', phone: 'फोन', email: 'ईमेल', address: 'पत्ता', formTitle: 'संपर्क फॉर्म',
      send: 'संदेश पाठवा',
    },
    form: { fullName: 'पूर्ण नाव', mobile: 'मोबाईल क्रमांक', email: 'ईमेल पत्ता', subject: 'विषय', message: 'संदेश', place: 'गाव / शहर', optional: 'ऐच्छिक', yourEmail: 'तुमचा ईमेल लिहा' },
    footer: {
      quick: 'महत्त्वाचे दुवे', initiatives: 'आमचे उपक्रम', newsTitle: 'अपडेट्स मिळवा',
      newsDesc: 'आगामी कार्यक्रम आणि Gram Guru Foundation च्या अपडेट्ससाठी सबस्क्राइब करा.', newsBtn: 'सबस्क्राइब',
      subscribed: 'सबस्क्राइब केल्याबद्दल धन्यवाद!', already: 'तुम्ही आधीच सबस्क्राइब केले आहे.', rights: 'सर्व हक्क राखीव.',
    },
  },
};
