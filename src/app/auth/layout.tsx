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
            <div className="  min-h-screen  flex items-center justify-center p-4">
                {children}
            </div>
            <PreFooterIconModule />
            <Footer />
        </>

    );
}
