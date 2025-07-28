import React from "react";
import { InputWithButton } from "@/components/search-bar";
import Image from "next/image";

const Home = () => {
  return (
    <section>
      <div className="md:hidden w-full flex justify-center">
        <InputWithButton />
      </div>
      <div>
        <h2 className="text-2xl font-bold my-4">Today&apos;s Deals</h2>
        <div>
          <div className="grid gap-4 max-sm:[grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-xl relative">
                <Image
                  src="/image.png"
                  alt="Deal 1"
                  fill
                  className="object-cover h-[90%] rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white rounded-xl">
                  <p className="text-md font-bold line-clamp-1">Product Name</p>
                  <p className="text-sm line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Inventore laboriosam reprehenderit esse mollitia officia
                    accusantium aliquid quidem expedita commodi dolor? Rem
                    doloribus esse error qui rerum quisquam dolor aspernatur
                    eum?
                  </p>
                  <p className="text-md font-bold line-clamp-1">$100.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold my-4">New Arrivals</h2>
        <div>
          <div className="grid gap-4 max-sm:[grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-xl relative">
                <Image
                  src="/image.png"
                  alt="Deal 1"
                  fill
                  className="object-cover h-[90%] rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white rounded-xl">
                  <p className="text-md font-bold line-clamp-1">Product Name</p>
                  <p className="text-sm line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Inventore laboriosam reprehenderit esse mollitia officia
                    accusantium aliquid quidem expedita commodi dolor? Rem
                    doloribus esse error qui rerum quisquam dolor aspernatur
                    eum?
                  </p>
                  <p className="text-md font-bold line-clamp-1">$100.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
