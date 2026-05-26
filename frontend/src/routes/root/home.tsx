import Cta from "@/components/root/home/cta"
import Faq from "@/components/root/home/faq"
import Hero from "@/components/root/home/hero"
import Product from "@/components/root/home/product"

const Home = () => {
  return (
    <div>
      <Hero />
      <Product />
     
      <Faq/>
      <Cta/>
    </div>
  )
}

export default Home

