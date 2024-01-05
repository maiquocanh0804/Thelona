
import {Menu,message} from 'antd';
import {Link} from 'react-router-dom';
export default function menuAccount (props){
    const key = 'updatable';
    const {name} = props.data;
    const handleLogout = ()=>{
        message.loading({ content: 'Đang đăng xuất...', key });
        setTimeout(()=>{
            localStorage.removeItem("token");
            props.refreshAccount();
            message.success({ content: 'Đăng xuất thành công!', key, duration: 2 });
        },1000)
    }
    return(
        <Menu theme="light" style={{boxShadow:'2px 2px 50px #00000026', borderRadius:'4px'}}>
            <Menu.Item key="bill" >
                <Link to="/billfollow">
                Đơn hàng
                </Link>
            </Menu.Item>
            <Menu.Item key="profile" >
                <Link to="/profile">
                    {"Thông tin tài khoản " }
                </Link>
            </Menu.Item>
            
            <Menu.Item key="logout" onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    )
}