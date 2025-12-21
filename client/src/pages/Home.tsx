import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, Download, Loader2, X } from "lucide-react";
import logoSvg from "@assets/logo.svg";

type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Connect stream to video element after it's mounted
  useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        // Autoplay may fail, but the video element should still show the stream
      });
    }
  }, [showCamera]);

  const enhanceMutation = useMutation({
    mutationFn: async (imageData: string) => {
      setProcessingState("processing");
      const response = await fetch("/api/enhance-smile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al procesar la imagen");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setEnhancedImage(data.enhancedImage);
      setProcessingState("complete");
    },
    onError: (error: Error) => {
      setProcessingState("error");
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo no válido",
        description: "Por favor, sube una imagen (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo es 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      setEnhancedImage(null);
      setProcessingState("uploading");
      enhanceMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
  }, [enhanceMutation, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      // Set showCamera to true first, then useEffect will connect the stream
      // to the video element after it's mounted
      setShowCamera(true);
    } catch {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    
    stopCamera();
    setOriginalImage(base64);
    setEnhancedImage(null);
    setProcessingState("uploading");
    enhanceMutation.mutate(base64);
  }, [enhanceMutation, stopCamera]);

  const downloadImage = useCallback(() => {
    if (!enhancedImage) return;
    
    const link = document.createElement("a");
    link.href = enhancedImage;
    link.download = "mi-nueva-sonrisa.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [enhancedImage]);

  const reset = useCallback(() => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setProcessingState("idle");
    stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-black">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <a href="https://www.doctordiegoserrano.com" target="_blank" rel="noopener noreferrer" data-testid="link-logo">
            <img src={logoSvg} alt="Dr. Diego Serrano - Estética Dental" className="h-8 md:h-10" />
          </a>
          <a
            href="https://www.doctordiegoserrano.com/contacto/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-opacity hover:opacity-90 bg-yellow-200 text-gray-900"
            data-testid="link-header-cta"
          >
            <span className="hidden sm:inline">Pedir una cita</span>
            <span className="sm:hidden">Cita</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        <section className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-title">
            SIMULA TU SONRISA PERFECTA
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubre cómo podría lucir tu nueva sonrisa.
            Sube una foto y visualiza tu transformación en segundos.
          </p>
        </section>

        {showCamera ? (
          <Card className="relative overflow-hidden bg-black aspect-video max-w-2xl mx-auto mb-8">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              data-testid="video-camera"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="bg-primary border-primary-border text-primary-foreground rounded-full"
                data-testid="button-capture"
              >
                <Camera className="h-5 w-5 mr-2" />
                Capturar foto
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
                className="bg-white/90"
                data-testid="button-cancel-camera"
              >
                <X className="h-5 w-5 mr-2" />
                Cancelar
              </Button>
            </div>
          </Card>
        ) : !originalImage ? (
          <section className="mb-10 md:mb-16">
            <Card
              className={`relative min-h-64 md:min-h-80 border transition-all cursor-pointer shadow-sm ${
                isDragging
                  ? "border-accent bg-accent/5"
                  : "border-gray-300/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              data-testid="dropzone-upload"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Arrastra tu foto aquí o haz clic para subirla
                </h2>                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    data-testid="button-select-file"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    data-testid="button-open-camera"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Usar cámara
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  JPG, PNG (máx. 5MB)
                </p>
              </div>
            </Card>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
              data-testid="input-file"
            />
          </section>
        ) : (
          <section className="mb-10 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="relative">
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={originalImage}
                    alt="Foto original"
                    className="w-full h-full object-cover"
                    data-testid="img-original"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-2 px-4 text-center font-medium tracking-wide">
                  ANTES
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                  {processingState === "processing" || processingState === "uploading" ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-lg font-medium">Creando tu nueva sonrisa...</p>
                      <p className="text-sm text-muted-foreground">
                        Esto puede tardar unos segundos
                      </p>
                    </div>
                  ) : enhancedImage ? (
                    <img
                      src={enhancedImage}
                      alt="Simulación de sonrisa"
                      className="w-full h-full object-cover"
                      data-testid="img-enhanced"
                    />
                  ) : processingState === "error" ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <p className="text-destructive font-medium">Error al procesar</p>
                      <Button onClick={reset} variant="outline" data-testid="button-retry">
                        Intentar de nuevo
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white py-2 px-4 text-center font-medium tracking-wide">
                  DESPUÉS
                </div>
              </div>
            </div>

            {processingState === "complete" && enhancedImage && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  size="lg"
                  data-testid="button-download"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar imagen
                </Button>
                <Button
                  onClick={reset}
                  variant="ghost"
                  size="lg"
                  data-testid="button-new-photo"
                >
                  Probar con otra foto
                </Button>
              </div>
            )}
          </section>
        )}

        {processingState === "complete" && enhancedImage && (
          <section className="text-center py-8 md:py-12 border-t">
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              ¿Te gusta el resultado? Agenda tu consulta gratuita hoy
            </p>
            <a
              href="https://www.doctordiegoserrano.com/contacto/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 md:px-12 py-4 text-lg font-medium rounded-full transition-opacity hover:opacity-90"
              data-testid="button-cta-appointment"
            >
              Pedir una Cita
            </a>
            <p className="text-sm text-muted-foreground mt-6 max-w-lg mx-auto">
              Esta es una simulación digital. Los resultados reales pueden variar según las características individuales de cada paciente.
            </p>
          </section>
        )}

        <footer className="text-center py-8 border-t text-sm text-muted-foreground">
          <p>
            Dr. Diego Serrano - Estética Dental en Zaragoza
          </p>
          <p className="mt-2">
            <a
              href="https://www.doctordiegoserrano.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              data-testid="link-footer-website"
            >
              www.doctordiegoserrano.com
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}