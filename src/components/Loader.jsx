import { Html } from '@react-three/drei';

const Loader = () => {
return ( <Html center> <div className="flex flex-col items-center gap-3 whitespace-nowrap"> <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />

   <p className="text-sm font-medium text-gray-500">
      Loading...
    </p>
  </div>
</Html>


);
};

export default Loader;
