import logo from "../../assets/images/drishti-logo.png";

export default function Logo() {
  return (
    <a className="logo" href="#home" aria-label="Drishti AI home">
      <img src={logo} alt="Drishti AI — For Clearer Tomorrows" />
    </a>
  );
}
