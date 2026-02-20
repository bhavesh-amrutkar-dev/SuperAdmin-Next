import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <div className="flex items-center justify-center mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 lg:py-16 xl:py-20">
                {children}
            </div>
            <PreFooterIconModule />
            <Footer />
        </>

    );
}
