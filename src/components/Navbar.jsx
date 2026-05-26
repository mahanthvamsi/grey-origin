import StaggeredMenu from "./StaggeredMenu";

const menuItems = [
  { label: "Work",    ariaLabel: "View our work",    link: "/#work" },
  { label: "About",   ariaLabel: "About Grey Origin", link: "/#about" },
  { label: "Contact", ariaLabel: "Get in touch",      link: "/#contact" },
];

const socialItems = [
  { label: "Instagram", link: "https://instagram.com" },
  { label: "YouTube",   link: "https://youtube.com" },
];

export default function Navbar() {
  return (
    <StaggeredMenu
      position="right"
      isFixed={true}
      items={menuItems}
      socialItems={socialItems}
      displaySocials={true}
      displayItemNumbering={false}
      colors={["#d4d4d0", "#e0e0db"]}
      closeOnClickAway={true}
    />
  );
}
