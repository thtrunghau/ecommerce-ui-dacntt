import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Group as GroupIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import type { ProductResDto, CategoryResDto } from "../../types";
import {
  extractBaseName,
  parseVariantInfo,
  groupProductsByVariant,
} from "../../utils/productVariants";
import { formatPrice } from "../../utils/formatPrice";
import { getProductImageUrl } from "../../utils/imageUtils";

interface AdminVariantManagerProps {
  products: ProductResDto[];
  categories: CategoryResDto[];
  onProductCreate: (product: Partial<ProductResDto>) => Promise<void>;
  onProductUpdate: (
    id: string,
    product: Partial<ProductResDto>,
  ) => Promise<void>;
  onProductDelete: (id: string) => Promise<void>;
  onProductDuplicate: (product: ProductResDto) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdminVariantManager: React.FC<AdminVariantManagerProps> = ({
  products,
  categories,
  onProductCreate,
  onProductUpdate,
  onProductDelete,
  onProductDuplicate,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedVariantGroup, setSelectedVariantGroup] = useState<
    string | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResDto | null>(
    null,
  );
  const [newVariantData, setNewVariantData] = useState({
    baseName: "",
    category: "",
    variants: [] as { type: string; value: string }[],
    price: 0,
    quantity: 0,
    description: "",
    image: "",
  });

  // Group products by variant
  const variantGroups = useMemo(() => {
    const groups = groupProductsByVariant(products);
    return Object.entries(groups).map(([baseName, variants]) => ({
      baseName,
      variants: variants as ProductResDto[],
      totalVariants: (variants as ProductResDto[]).length,
      totalStock: (variants as ProductResDto[]).reduce(
        (sum: number, v: ProductResDto) => sum + v.quantity,
        0,
      ),
      priceRange: [
        Math.min(
          ...(variants as ProductResDto[]).map((v: ProductResDto) => v.price),
        ),
        Math.max(
          ...(variants as ProductResDto[]).map((v: ProductResDto) => v.price),
        ),
      ] as [number, number],
    }));
  }, [products]);

  // Get variant statistics
  const variantStats = useMemo(() => {
    const totalGroups = variantGroups.length;
    const totalVariants = products.length;
    const productsWithVariants = variantGroups.filter(
      (g) => g.totalVariants > 1,
    ).length;
    const avgVariantsPerGroup =
      totalGroups > 0 ? (totalVariants / totalGroups).toFixed(1) : 0;

    return {
      totalGroups,
      totalVariants,
      productsWithVariants,
      avgVariantsPerGroup,
    };
  }, [variantGroups, products]);

  const handleCreateVariant = async () => {
    try {
      const fullProductName = `${newVariantData.baseName} ${newVariantData.variants
        .map((v) => v.value)
        .join(" ")}`;

      await onProductCreate({
        productName: fullProductName,
        price: newVariantData.price,
        quantity: newVariantData.quantity,
        description: newVariantData.description,
        image: newVariantData.image,
        categoryId: newVariantData.category,
      });

      setIsCreateDialogOpen(false);
      setNewVariantData({
        baseName: "",
        category: "",
        variants: [],
        price: 0,
        quantity: 0,
        description: "",
        image: "",
      });
    } catch (error) {
      console.error("Error creating variant:", error);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      await onProductUpdate(editingProduct.id, editingProduct);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDuplicateProduct = async (product: ProductResDto) => {
    try {
      await onProductDuplicate(product);
    } catch (error) {
      console.error("Error duplicating product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await onProductDelete(productId);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const addVariantAttribute = () => {
    setNewVariantData((prev) => ({
      ...prev,
      variants: [...prev.variants, { type: "color", value: "" }],
    }));
  };

  const removeVariantAttribute = (index: number) => {
    setNewVariantData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariantAttribute = (
    index: number,
    field: string,
    value: string,
  ) => {
    setNewVariantData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Variant Sản phẩm
      </Typography>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {variantStats.totalGroups}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhóm sản phẩm
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {variantStats.totalVariants}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng variants
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {variantStats.productsWithVariants}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sản phẩm có variants
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {variantStats.avgVariantsPerGroup}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trung bình variants/nhóm
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Tạo Variant Mới
        </Button>
        <Button
          variant="outlined"
          startIcon={<GroupIcon />}
          onClick={() => setTabValue(0)}
        >
          Xem Theo Nhóm
        </Button>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={() => setTabValue(1)}
        >
          Xem Tất Cả
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Nhóm Variants" />
        <Tab label="Tất Cả Sản Phẩm" />
      </Tabs>

      {/* Variant Groups Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {variantGroups.map((group) => (
            <Card key={group.baseName}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">{group.baseName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.totalVariants} variants • Tổng kho:{" "}
                      {group.totalStock}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giá: {formatPrice(group.priceRange[0])} -{" "}
                      {formatPrice(group.priceRange[1])}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() =>
                      setSelectedVariantGroup(
                        selectedVariantGroup === group.baseName
                          ? null
                          : group.baseName,
                      )
                    }
                  >
                    {selectedVariantGroup === group.baseName
                      ? "Thu gọn"
                      : "Mở rộng"}
                  </Button>
                </Box>

                {selectedVariantGroup === group.baseName && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "grid", gap: 2 }}>
                      {group.variants.map((variant: ProductResDto) => {
                        const variantInfo = parseVariantInfo(
                          variant.productName,
                        );
                        return (
                          <Box
                            key={variant.id}
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                              p: 2,
                              border: 1,
                              borderColor: "grey.300",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={getProductImageUrl(variant.image)}
                              alt={variant.productName}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2">
                                {variant.productName}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                {variantInfo.variants.map(
                                  (
                                    attr: { type: string; value: string },
                                    index: number,
                                  ) => (
                                    <Chip
                                      key={index}
                                      label={`${attr.type}: ${attr.value}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ),
                                )}
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatPrice(variant.price)} • Kho:{" "}
                                {variant.quantity}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Sao chép">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDuplicateProduct(variant)
                                  }
                                >
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingProduct(variant);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteProduct(variant.id)
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* All Products Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {products.map((product) => {
            const variantInfo = parseVariantInfo(product.productName);
            return (
              <Box
                key={product.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  p: 2,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <img
                  src={getProductImageUrl(product.image)}
                  alt={product.productName}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">
                    {product.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base: {extractBaseName(product.productName)}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {variantInfo.variants.map(
                      (
                        attr: { type: string; value: string },
                        index: number,
                      ) => (
                        <Chip
                          key={index}
                          label={`${attr.type}: ${attr.value}`}
                          size="small"
                          variant="outlined"
                        />
                      ),
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(product.price)} • Kho: {product.quantity}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Sao chép">
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateProduct(product)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      </TabPanel>

      {/* Create Variant Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo Variant Mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Tên Base Sản Phẩm"
              value={newVariantData.baseName}
              onChange={(e) =>
                setNewVariantData((prev) => ({
                  ...prev,
                  baseName: e.target.value,
                }))
              }
              fullWidth
              required
            />

            <TextField
              label="Danh mục"
              select
              value={newVariantData.category}
              onChange={(e) =>
                setNewVariantData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              fullWidth
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Thuộc tính Variant
              </Typography>
              {newVariantData.variants.map((variant, index) => (
                <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    label="Loại"
                    select
                    value={variant.type}
                    onChange={(e) =>
                      updateVariantAttribute(index, "type", e.target.value)
                    }
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="color">Màu sắc</MenuItem>
                    <MenuItem value="storage">Dung lượng</MenuItem>
                    <MenuItem value="size">Kích thước</MenuItem>
                    <MenuItem value="model">Mẫu</MenuItem>
                  </TextField>
                  <TextField
                    label="Giá trị"
                    value={variant.value}
                    onChange={(e) =>
                      updateVariantAttribute(index, "value", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton onClick={() => removeVariantAttribute(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={addVariantAttribute}>
                Thêm thuộc tính
              </Button>
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Giá"
                type="number"
                value={newVariantData.price}
                onChange={(e) =>
                  setNewVariantData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                required
              />
              <TextField
                label="Số lượng"
                type="number"
                value={newVariantData.quantity}
                onChange={(e) =>
                  setNewVariantData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                required
              />
            </Box>

            <TextField
              label="Mô tả"
              multiline
              rows={3}
              value={newVariantData.description}
              onChange={(e) =>
                setNewVariantData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
            />

            <TextField
              label="URL Hình ảnh"
              value={newVariantData.image}
              onChange={(e) =>
                setNewVariantData((prev) => ({
                  ...prev,
                  image: e.target.value,
                }))
              }
              fullWidth
            />

            <Alert severity="info">
              Tên sản phẩm sẽ được tạo tự động: "{newVariantData.baseName}{" "}
              {newVariantData.variants.map((v) => v.value).join(" ")}"
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleCreateVariant} variant="contained">
            Tạo Variant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Sản phẩm</DialogTitle>
        <DialogContent>
          {editingProduct && (
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              <TextField
                label="Tên sản phẩm"
                value={editingProduct.productName}
                onChange={(e) =>
                  setEditingProduct((prev: ProductResDto | null) =>
                    prev ? { ...prev, productName: e.target.value } : null,
                  )
                }
                fullWidth
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Giá"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct((prev: ProductResDto | null) =>
                      prev ? { ...prev, price: Number(e.target.value) } : null,
                    )
                  }
                />
                <TextField
                  label="Số lượng"
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct((prev: ProductResDto | null) =>
                      prev
                        ? { ...prev, quantity: Number(e.target.value) }
                        : null,
                    )
                  }
                />
              </Box>
              <TextField
                label="Mô tả"
                multiline
                rows={3}
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct((prev: ProductResDto | null) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
                fullWidth
              />
              <TextField
                label="URL Hình ảnh"
                value={editingProduct.image}
                onChange={(e) =>
                  setEditingProduct((prev: ProductResDto | null) =>
                    prev ? { ...prev, image: e.target.value } : null,
                  )
                }
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleEditProduct} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminVariantManager;
