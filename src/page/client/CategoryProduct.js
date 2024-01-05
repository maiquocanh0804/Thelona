import React ,{useEffect,useState} from 'react';
import * as MENU from '../../util/menuProduct';
import * as FetchAPI from '../../util/fetchApi';
import {useLocation,Link,useParams} from 'react-router-dom';
import {Row,Col,Empty,Breadcrumb} from 'antd';
import Product from '../../elements/product';
import Spinner from '../../elements/spinner';
export default function CategoryProduct(){
    const [dataProduct, setdataProduct] = useState([]);
    const [showContent, setshowContent] = useState(false);
    const [nameCategory, setnameCategory] = useState("");
    const [empty, setempty] = useState(false);
    const {id} = useParams();
    const location = useLocation();
    useEffect(()=>{
        setshowContent(false);
        getCategory();
    },[location])
    const getCategory = async()=>{
        // const idCategory = window.location.hash.substring(1);
        const category = await MENU.getCategoryById({"id":id});
        setnameCategory(category.name);
        const data = {"id":category.id}
        const product = await FetchAPI.postDataAPI('/product/getProductByCategory',data);
        if(product.length===0){
            setempty(true)
        }else{
            setempty(false)
        }
        setdataProduct(product);
        setshowContent(true);
    }
    const ItemProduct = dataProduct.map((item)=>{
        return(
            <div style={{ padding:'0 15px', marginBottom:12 }} >
                <Product
                    item={item}
                />
            </div>
        )
    })
    const Direction = ()=>(
        <Breadcrumb style={{ fontSize:18,paddingBottom:20 }}>
            <Breadcrumb.Item>
                <Link to={"/home"}>Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
               {nameCategory}
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    return(
        <div className="wrapper-category-product">
        
            {showContent ?
             
                <div>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'center', paddingTop:'60px' }}>
                    <span className="title-list"  style={{ fontSize:30,paddingBottom:20,fontWeight:'bold', width:'auto', margin:'auto' }}>
                    {nameCategory}
                </span>
                        {Direction()}
                    </div>
                {empty ?
                    <Empty className="empty" description="Không có sản phẩm"  />
                    :
                    <div>
                        <Row style={{rowGap: 24}}>
                            {ItemProduct}
                        </Row>
                    </div>
                }
                </div>
                :
                <Spinner spinning={!showContent}/>
            }
        </div>
    )
}