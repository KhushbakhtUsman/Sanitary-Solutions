import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { ProductCard } from "../../components/customer/ProductCard";
import { getStoreProductsApi } from "../../services/storeApi";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await getStoreProductsApi({ page: 1, limit: 6, sortBy: "featured" });
        setFeaturedProducts(data);
      } catch (error) {
        setProductsError(error.message || "Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 py-16">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="container mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Premium sanitaryware
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
              Elevate every bathroom with refined plumbing essentials.
            </h1>
            <p className="text-lg text-gray-600">
              Discover faucets, basins, showers, and accessories curated for durability and design. Trusted by
              contractors and homeowners alike.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg">
                  Browse Products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/quote">
                <Button size="lg" variant="outline">
                  Request a Quote
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "24h Dispatch", value: "Fast fulfillment" },
                { label: "200+ Brands", value: "Global partners" },
                { label: "5k+ Projects", value: "Trusted installs" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white p-4 shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1625578324458-a106197ff141?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc3Mjk1MDI2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Luxury bathroom interior"
                className="h-[420px] w-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-2xl bg-white px-6 py-4 shadow-lg">
              <p className="text-xs text-gray-500">Trusted rating</p>
              <p className="text-lg font-semibold text-gray-900">4.9 / 5.0</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white py-12">
        <div className="container mx-auto grid gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              title: "Quality Guaranteed",
              description: "ISO-certified products with rigorous checks",
              icon: ShieldCheck,
            },
            { title: "Fast Delivery", description: "Nationwide shipping in 48 hours", icon: Truck },
            { title: "Expert Support", description: "Plumbing consultants on call", icon: Headphones },
            { title: "Trusted Brands", description: "Partnered with global leaders", icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Featured products</h2>
            <p className="text-gray-600">Our most requested pieces for luxury bathroom projects.</p>
          </div>
          <Link to="/products">
            <Button variant="outline">View catalog</Button>
          </Link>
        </div>

        <div className="mt-8">
          {loadingProducts ? <p className="text-sm text-gray-500">Loading featured products...</p> : null}
          {productsError ? <p className="text-sm text-red-600">{productsError}</p> : null}
          {!loadingProducts && !productsError ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      
    </div>
  );
};
