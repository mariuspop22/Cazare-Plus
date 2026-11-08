import React, {useState} from "react";
import "./Header.css";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { FaUserCircle
    ,FaBars
    ,FaPlusCircle,
    FaCalendarCheck,
    FaSignOutAlt } from "react-icons/fa";
import
{
TbBuildingCommunity
} from 'react-icons/tb';
const Header = ({ onOpenRegister, onOpenLogin, isLoggedIn, onLogout, onAddProperty , onOwnerProperties}) => {

    const [menuButtonpress, setMenuButtonPress] = useState(false);
    const navigate = useNavigate();

    const handleMenuButtonPress = () => {
        setMenuButtonPress(prev => !prev);
    };
    return (
        <header className="header">
            <div className="header-content">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="header-links">
                {isLoggedIn ? (
                    <>
                        <button className="menu-bottom"
                        onClick={handleMenuButtonPress}>

                        <FaBars />
                        </button>

                    </>
                ) : (
                    <>

                        <a
                            className="nav-link register"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenRegister();

                            }}
                        >
                            Devino Partener
                        </a>
                        <a
                            className="nav-link login"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenLogin();

                            }}
                        >
                            <FaUserCircle />
                        </a>
                    </>
                )}
            </div>
            {menuButtonpress &&

                <div className="menu-content">
                    <div className="nav-link-icon">
                        <FaUserCircle/>
                        <a
                            className="nav-link logout"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/owner/profile');
                                handleMenuButtonPress();
                            }}
                        >
                            Profilul meu
                        </a>

                    </div>
                    <div className="nav-link-icon">
                        <TbBuildingCommunity/>
                        <a
                            className="nav-link logout"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/owner/properties');
                                handleMenuButtonPress();
                            }}
                        >
                            Proprietatiile mele
                        </a>

                    </div>
                    <div className="nav-link-icon">
                        < FaPlusCircle />
                        <a
                            className="nav-link add-property"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/add-property');
                                handleMenuButtonPress();
                            }}
                        >
                            Adaugă proprietate
                        </a>
                    </div>
                    <div className="nav-link-icon">
                        <FaCalendarCheck/>
                        <a
                            className="nav-link logout"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/owner/select-property-for-managing-availability');

                                handleMenuButtonPress();
                            }}
                        >
                            Gestionează disponibilitatea
                        </a>

                    </div>

                    <div className="nav-link-icon">

                    <FaSignOutAlt />
                    <a
                        className="nav-link logout"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onLogout) onLogout();
                            handleMenuButtonPress();
                            navigate('/');
                        }}
                    >
                        Deconectare
                    </a>
                    </div>






            </div> }
        </header>
    );
};
export default Header;