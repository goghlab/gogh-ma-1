import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Resource } from "@/lib/types";
import { truncateUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

type ResourcesProps = {
  resources: Resource[];
  customWidth?: number;
  handleCardClick?: (resource: Resource) => void;
  removeResource?: (url: string) => void;
};

export function Resources({
  resources,
  handleCardClick,
  removeResource,
  customWidth,
}: ResourcesProps) {
  const [cardWidth, setCardWidth] = useState<number | string>(customWidth || 320);
  
  // 响应式调整卡片宽度
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (customWidth) {
        setCardWidth(customWidth);
      } else {
        setCardWidth(isMobile ? window.innerWidth - 40 : 320);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [customWidth]);

  return (
    <div data-test-id="resources" className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 md:overflow-x-auto">
      {resources.map((resource, idx) => (
        <Card
          data-test-id={`resource`}
          key={idx}
          className={
            "bg-[#242428] border-0 shadow-none rounded-xl text-md font-extralight focus-visible:ring-0 flex-none" +
            (handleCardClick ? " cursor-pointer" : "")
          }
          style={{ width: typeof cardWidth === 'number' ? `${cardWidth}px` : cardWidth }}
          onClick={() => handleCardClick?.(resource)}
        >
          <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
            <div className="flex items-start space-x-3 text-sm">
              <div className="flex-grow">
                <h3
                  className="font-bold text-base md:text-lg text-zinc-200"
                  style={{
                    maxWidth: typeof cardWidth === 'number' ? `${(cardWidth as number) - 30}px` : "calc(100% - 30px)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resource.title}
                </h3>
                <p
                  className="text-sm md:text-base mt-2 text-zinc-300"
                  style={{
                    maxWidth: typeof cardWidth === 'number' ? `${(cardWidth as number) - 30}px` : "calc(100% - 30px)",
                    overflowWrap: "break-word",
                  }}
                >
                  {resource.description?.length > 250
                    ? resource.description.slice(0, 250) + "..."
                    : resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm hover:underline mt-3 text-zinc-400 inline-block"
                  title={resource.url}
                  style={{
                    width: typeof cardWidth === 'number' ? `${(cardWidth as number) - 30}px` : "calc(100% - 30px)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resource.description && (
                    <>
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${resource.url}`}
                        alt="favicon"
                        className="inline-block mr-2"
                        style={{ width: "16px", height: "16px" }}
                      />
                      {truncateUrl(resource.url)}
                    </>
                  )}
                </a>
              </div>
              {removeResource && (
                <div className="flex items-start absolute top-2 md:top-4 right-2 md:right-4">
                  <Button
                    data-test-id="remove-resource"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeResource?.(resource.url);
                    }}
                    aria-label={`Remove ${resource.url}`}
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-zinc-400 hover:text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
