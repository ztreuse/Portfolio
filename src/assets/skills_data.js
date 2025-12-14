import htmlLogo from "./skills/html.png";
import cssLogo from "./skills/css.png";
import jsLogo from "./skills/javascript.png";
import reactLogo from "./skills/react.png";
import reactNativeLogo from "./skills/react_native.png";
import phpLogo from "./skills/php.png";
import pythonLogo from "./skills/python.png";
import postgresqlLogo from "./skills/postgresql.png";
import tailwindLogo from "./skills/tailwind.png";
import codeIgniterLogo from "./skills/codeigniter.png";
import bootstrapLogo from "./skills/bootstrap.png";
import gitLogo from "./skills/git.png";
import figmaLogo from "./skills/figma.png";
import photoshopLogo from "./skills/photoshop.png";
import capcutLogo from "./skills/capcut.png";
import expoLogo from "./skills/expo.png";
import pmiLogo from "./skills/pmi.png";

const skillData = [
    // -----------------------------------------------------
    // 💻 CORE WEB DEVELOPMENT & PROGRAMMING
    // -----------------------------------------------------
    { 
        id: 1, 
        title: "HTML, CSS, Javascript, React, React Native, PHP, Python, PostgreSQL", 
        icon: htmlLogo,
        category: "Core"
    },
    
    // -----------------------------------------------------
    // 🌐 FRAMEWORKS, LIBRARIES & STYLING
    // -----------------------------------------------------
    { 
        id: 9, 
        title: "Tailwind CSS, Bootstrap, CodeIgniter", 
        icon: tailwindLogo,
        category: "Frameworks"
    },
    
    // -----------------------------------------------------
    // ⚙️ TOOLS, DESIGN, AND VERSION CONTROL
    // -----------------------------------------------------
    { 
        id: 12, 
        title: "Git, Figma, Adobe Photoshop, Capcut, Expo", 
        icon: gitLogo,
        category: "Tools"
    },

    // -----------------------------------------------------
    // 🛡️ OTHER RELATED EXPERTISE (Certifications)
    // You can use the certification logo or the technology logo if available.
    // -----------------------------------------------------
    { 
        id: 17, 
        title: "Project Management Ready", 
        icon: pmiLogo,
        category: "Expertise"
    },
];

export default skillData;