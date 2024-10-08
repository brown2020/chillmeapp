const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center mx-auto mt-20 w-1/3 bg-black text-white p-6 rounded-lg gap-y-5">
      {children}
    </div>
  );
};

export default LayoutWrapper;
