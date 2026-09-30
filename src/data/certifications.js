import itSpecialistHtmlAndCss from '../assets/certifications/it-specialist-html-and-css.png';
import itSpecialistJavascript from '../assets/certifications/it-specialist-javascript.png';
import itSpecialistNetworking from '../assets/certifications/it-specialist-networking.png';
import itSpecialistPython from '../assets/certifications/it-specialist-python.png';
import ccnaIntroductionToNetworks from '../assets/certifications/ccna-introduction-to-networks.png';
import ccnaSwitchingRoutingAndWirelessEssentials from '../assets/certifications/ccna-switching-routing-and-wireless-essentials.png';
import ccnaEnterpriseNetworkingSecurityAndAutomation from '../assets/certifications/ccna-enterprise-networking-security-and-automation.png';
import devnetAssociate from '../assets/certifications/devnet-associate.png';
import cyberopsAssociate from '../assets/certifications/cyberops-associate.png';
import ciscoCertifiedSupportTechnicianCybersecurity from '../assets/certifications/cisco-certified-support-technician-cybersecurity.png';
import pmiProjectManagementReady from '../assets/certifications/pmi-project-management-ready.png';

// Dates are ISO (YYYY-MM-DD) so they can be formatted consistently.
// `badgeId` is the Credly badge ID from the badge's embed code (data-share-badge-id); it builds the
// public verification link. `image` is the badge artwork downloaded from Credly (340px).
const certifications = [
  {
    name: 'IT Specialist - HTML and CSS',
    issuer: 'Certiport',
    date: '2024-11-28',
    badgeId: 'fe73abea-d20e-463d-b49d-bab3034a1637',
    image: itSpecialistHtmlAndCss,
  },
  {
    name: 'IT Specialist - JavaScript',
    issuer: 'Certiport',
    date: '2025-11-24',
    badgeId: 'e0329e81-c1da-485b-9033-ec0d43d40b77',
    image: itSpecialistJavascript,
  },
  {
    name: 'IT Specialist - Networking',
    issuer: 'Certiport',
    date: '2024-07-13',
    badgeId: 'd22dd3ef-5fa2-4f81-acbd-eefab5360d8e',
    image: itSpecialistNetworking,
  },
  {
    name: 'IT Specialist - Python',
    issuer: 'Certiport',
    date: '2024-03-24',
    badgeId: '07a6a4d7-6b95-48ae-ba0a-b63df9845726',
    image: itSpecialistPython,
  },
  {
    name: 'CCNA: Introduction to Networks',
    issuer: 'Cisco',
    date: '2024-03-25',
    badgeId: '5709bd0d-c5cb-41fa-aafa-b50137bdc47c',
    image: ccnaIntroductionToNetworks,
  },
  {
    name: 'CCNA: Switching, Routing, and Wireless Essentials',
    issuer: 'Cisco',
    date: '2024-07-19',
    badgeId: '37abfb9e-58d8-4bb0-81a4-edf7585f31c3',
    image: ccnaSwitchingRoutingAndWirelessEssentials,
  },
  {
    name: 'CCNA: Enterprise Networking, Security, and Automation',
    issuer: 'Cisco',
    date: '2025-01-22',
    badgeId: '8d992827-fd7b-492a-8ff6-e1179b0a7979',
    image: ccnaEnterpriseNetworkingSecurityAndAutomation,
  },
  {
    name: 'DevNet Associate',
    issuer: 'Cisco',
    date: '2025-03-21',
    badgeId: '68a249b5-0b6f-4fd3-ae66-8b146527a484',
    image: devnetAssociate,
  },
  {
    name: 'CyberOps Associate',
    issuer: 'Cisco',
    date: '2025-11-17',
    badgeId: 'b43a3f4e-a016-4ee6-9d82-7ecab1a8e7c5',
    image: cyberopsAssociate,
  },
  {
    name: 'Cisco Certified Support Technician Cybersecurity',
    issuer: 'Cisco',
    date: '2025-11-25',
    badgeId: '044f157a-8e26-47e0-baaa-fb9e66ced734',
    image: ciscoCertifiedSupportTechnicianCybersecurity,
  },
  {
    name: 'PMI Project Management Ready™',
    issuer: 'Project Management Institute',
    date: '2025-03-13',
    badgeId: '62de8119-ad6d-4e6d-91e8-fc7c2ca64f77',
    image: pmiProjectManagementReady,
  },
];

export default certifications;
