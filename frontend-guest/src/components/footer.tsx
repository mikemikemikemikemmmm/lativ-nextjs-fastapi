const Interval = () => {
    return <span className=" inline-block h-full mx-5 bg-gray-400" style={{ width: 1 }}></span>
}
export const Footer = () => {
    return <footer>
        <hr />
        <div className="flex mt-5">
            <span className="flex justify-center items-center">
                <span>聯絡lativ</span>
                <Interval/>
                <span>購物說明</span>
                <Interval/>
                <span>最新消息</span>
            </span>
            <span className="ml-auto flex  justify-center items-center">
                <span>網站使用條款</span>
                <Interval/>
                <span>隱私權政策</span>
                <Interval/>
                <span>免責聲明</span>
                <Interval/>
                <span>© 2025 lativ</span>
            </span>
        </div>
    </footer>
}