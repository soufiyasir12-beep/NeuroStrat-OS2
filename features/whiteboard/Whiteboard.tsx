import React, { useEffect, useState } from 'react';
import { Tldraw } from 'tldraw';

export const Whiteboard: React.FC = () => {
    // Tldraw needs to be in a container with dimensions. 
    // The previous implementation might have collapsed if the parent didn't enforce height.
    // Also, we want to force the dark mode for the canvas to match Neurostrat.

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-surface shadow-2xl relative">
             {/* 
                We use an absolute positioned div to ensure Tldraw takes full available space.
                The className 'tldraw-component' is sometimes needed for scoping.
             */}
            <div className="absolute inset-0">
                <Tldraw 
                    persistenceKey="neurostrat-whiteboard"
                    hideUi={false}
                    className="tldraw-neurostrat-theme"
                    options={{
                        isDarkMode: true
                    }}
                />
            </div>
            
            {/* Overlay to ensure the style matches perfectly if Tldraw CSS overrides are needed */}
            <style>{`
                .tl-container {
                    background-color: #09090b !important;
                }
                .tl-grid {
                    opacity: 0.1 !important;
                }

                /* --- Main Toolbar (Tools) -> Left Vertical --- */
                .tlui-layout .tlui-toolbar {
                    position: absolute !important;
                    top: 50% !important;
                    left: 16px !important;
                    right: auto !important;
                    bottom: auto !important;
                    transform: translateY(-50%) !important;
                    
                    grid-auto-flow: row !important;
                    grid-template-columns: 1fr !important;
                    width: auto !important;
                    height: auto !important;
                    padding: 8px 6px !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                    background-color: #18181b !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                }

                /* --- Style Panel (Colors) -> Right Vertical Single Column --- */
                .tlui-style-panel {
                    position: absolute !important;
                    top: 50% !important;
                    right: 16px !important;
                    left: auto !important;
                    bottom: auto !important;
                    transform: translateY(-50%) !important;
                    
                    width: 56px !important; /* Fixed narrow width for cleanliness */
                    max-height: 85% !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    
                    border-radius: 8px !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                    background-color: #18181b !important;
                    padding: 12px 0 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                }

                /* Force Single Column Grid for Colors */
                .tlui-style-panel .tlui-buttons__grid {
                    grid-template-columns: 1fr !important;
                    gap: 8px !important;
                    width: 100% !important;
                    justify-items: center !important;
                    padding: 0 !important;
                }

                /* Refine Button Sizes in Style Panel */
                .tlui-style-panel .tlui-button {
                    width: 32px !important;
                    height: 32px !important;
                    min-width: 32px !important;
                    min-height: 32px !important;
                    border-radius: 6px !important;
                }

                /* Spacing between sections */
                .tlui-style-panel__section {
                    margin-bottom: 12px !important;
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }

                /* Hide scrollbar for cleaner look */
                .tlui-style-panel::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
            `}</style>
        </div>
    );
};